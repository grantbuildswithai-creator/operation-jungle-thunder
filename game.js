import {drawSoldier} from './sprites.js';
import {Sound} from './audio.js';
import {Mission,WIDTH,HEIGHT,WORLD,clamp,random} from './engine.js';
const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=false;
const mission=new Mission();
const keys=new Set();let last=performance.now(),gamepadGrenade=false,gamepadPause=false,uiClock=0,visualTime=0;
let best=0;try{best=Number(localStorage.getItem('ojt-best')||0)||0;}catch{}
$('best').textContent=String(best).padStart(6,'0');
const palette={dark:'#142b20',leaf:'#345735',light:'#597747',edge:'#1c3827',dirt:'#626049',sand:'#a49867',ink:'#152117'};
let aimMode='classic',difficulty='medium',pointer=null;
try{const options=JSON.parse(localStorage.getItem('ojt-options')||'{}');if(['classic','mouse'].includes(options.aim))aimMode=options.aim;if(['easy','medium','hard','impossible'].includes(options.difficulty))difficulty=options.difficulty;}catch{}
const runOptions=document.createElement('div');runOptions.className='run-options';
runOptions.innerHTML='<label>AIMING<select id="aim-mode"><option value="classic">Classic · movement</option><option value="mouse">Mouse · point to aim</option></select></label><label>DIFFICULTY<select id="difficulty"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="impossible">Impossible</option></select></label>';
$('start').before(runOptions);$('aim-mode').value=aimMode;$('difficulty').value=difficulty;
function saveOptions(){aimMode=$('aim-mode').value;difficulty=$('difficulty').value;try{localStorage.setItem('ojt-options',JSON.stringify({aim:aimMode,difficulty}));}catch{}}
$('aim-mode').addEventListener('change',saveOptions);$('difficulty').addEventListener('change',saveOptions);
document.addEventListener('pointermove',e=>{if(mission.state!=='playing')return;const r=canvas.getBoundingClientRect();pointer={x:clamp((e.clientX-r.left)/r.width*WIDTH,0,WIDTH),y:clamp((e.clientY-r.top)/r.height*HEIGHT,0,HEIGHT)};});

const sound=new Sound(enabled=>{
  $('sound').textContent=enabled?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-pressed',String(enabled));
});
const pauseActions=document.createElement('div');pauseActions.className='pause-actions';pauseActions.hidden=true;
pauseActions.innerHTML='<button id="restart-run" class="secondary-button">RESTART RUN</button><button id="quit-run" class="secondary-button" aria-keyshortcuts="Q">QUIT TO TITLE · Q</button>';
$('start').after(pauseActions);
$('restart-run').addEventListener('click',()=>{beginRun();});
$('quit-run').addEventListener('click',()=>{
  keys.clear();sound.reset();mission.reset();mission.state='title';
  showOverlay('JUNGLE THUNDER','OPERATION 001','The rescue starts with you.<br>Move north. Leave no one behind.','DEPLOY');
  $('overlay-footnote').textContent='WASD / ARROWS TO MOVE · RIGHT SHIFT FOR GRENADES';
  $('radio-text').textContent='“Get into the valley. Find the camp. We’ll have a bird waiting.”';syncUI();
});
mission.listeners.push(e=>{
  sound.event(e.type);
  if(e.type==='radio')$('radio-text').textContent=e.text;
  if(e.type==='end'){
    if(e.score>best){best=e.score;try{localStorage.setItem('ojt-best',String(best));}catch{};}
    showOverlay(e.success?'MISSION ACCOMPLISHED':'MISSION FAILED',e.success?'THEY MADE IT HOME':e.ending==='boarded'?'AIRCRAFT LOST':'SIGNAL LOST',e.success?`Four prisoners rescued. Your last stand lasted ${Math.floor(e.finalTime)} seconds.<br>Final score: ${e.score.toLocaleString()}`:e.ending==='boarded'?'Without covering fire, the helicopter was shot down.<br>No survivors.':'The rescue remains unfinished.<br>Regroup, learn the valley, and try again.','DEPLOY AGAIN');
    $('overlay-footnote').textContent=e.success?'YOUR SACRIFICE WILL NOT BE FORGOTTEN':'THREE LIVES. ONE MISSION.';syncUI();
  }
});
function showOverlay(title,kicker,description,button){$('overlay-title').textContent=title;$('overlay-title').style.fontSize=title.length>20?'48px':'58px';$('overlay-kicker').textContent=kicker;$('overlay-description').innerHTML=description;$('start').innerHTML=`${button} <span>→</span>`;$('overlay').classList.remove('hidden');pauseActions.hidden=mission.state!=='paused';runOptions.hidden=mission.state!=='title';}
function beginRun(){sound.reset();mission.start({difficulty});pointer=null;$('overlay').classList.add('hidden');pauseActions.hidden=true;runOptions.hidden=true;canvas.style.cursor=aimMode==='mouse'?'crosshair':'default';if(!sound.context)sound.enable(true);keys.clear();canvas.focus();syncUI();}
function startOrResume(){
  if(mission.state==='paused'){mission.state='playing';$('overlay').classList.add('hidden');}
  else {beginRun();}
  keys.clear();canvas.focus();syncUI();
}
function pause(){
  if(mission.state==='playing'){mission.state='paused';keys.clear();showOverlay('FIELD PAUSED','TAKE A BREATHER','Your mission will be here when you’re ready.','RESUME');$('overlay-footnote').textContent='ESC TO RESUME · Q TO QUIT TO TITLE';}
  else if(mission.state==='paused')startOrResume();
}
$('start').addEventListener('click',startOrResume);$('pause').addEventListener('click',pause);$('sound').addEventListener('click',()=>sound.enable(!sound.enabled));
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.arcade').requestFullscreen();canvas.focus();}catch{mission.announce('FULLSCREEN UNAVAILABLE',2);}}
$('fullscreen').addEventListener('click',fullscreen);
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'EXIT FULLSCREEN ⛶':'FULLSCREEN ⛶';});
document.addEventListener('keydown',e=>{
  if(e.code==='KeyQ'&&!e.repeat&&mission.state==='paused'){e.preventDefault();$('quit-run').click();return;}
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftRight'].includes(e.code))e.preventDefault();
  if(e.code==='Escape'&&!e.repeat)pause();
  if(e.code==='KeyF'&&!e.repeat)fullscreen();
  if(e.code==='Enter'&&!e.repeat&&['title','ended','paused'].includes(mission.state))startOrResume();
  if(e.code==='ShiftRight'&&!e.repeat)mission.throwGrenade();
  keys.add(e.code);
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();if(mission.state==='playing')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mission.state==='playing')pause();});
function input(){
  let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  let y=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));let grenade=false;
  const pad=Array.from(navigator.getGamepads?.()||[]).find(Boolean);
  if(pad){
    x=Math.abs(pad.axes[0]||0)>.35?Math.sign(pad.axes[0]):x;y=Math.abs(pad.axes[1]||0)>.35?Math.sign(pad.axes[1]):y;
    if(pad.buttons[14]?.pressed)x=-1;if(pad.buttons[15]?.pressed)x=1;if(pad.buttons[12]?.pressed)y=-1;if(pad.buttons[13]?.pressed)y=1;
    const a=!!pad.buttons[0]?.pressed,b=!!pad.buttons[9]?.pressed;
    if(a&&!gamepadGrenade){if(['title','ended','paused'].includes(mission.state))startOrResume();else grenade=true;}
    if(b&&!gamepadPause)pause();gamepadGrenade=a;gamepadPause=b;
  }else {gamepadGrenade=false;gamepadPause=false;}
  $('controller-status').textContent=pad?'CONTROLLER CONNECTED':aimMode==='mouse'?'MOUSE AIM':'KEYBOARD READY';
  const result={x,y,grenade};
  if(aimMode==='mouse'&&pointer){result.aimX=pointer.x;result.aimY=pointer.y+mission.camera;}
  // Optional aim mode supports a controller's right stick as well as the mouse.
  if(aimMode==='mouse'&&pad&&Math.hypot(pad.axes[2]||0,pad.axes[3]||0)>.35){result.aimX=mission.player.x+(pad.axes[2]||0)*100;result.aimY=mission.player.y+(pad.axes[3]||0)*100;}
  return result;
}
function syncUI(){
  $('score').textContent=String(Math.floor(mission.score)).padStart(6,'0');$('best').textContent=String(best).padStart(6,'0');
  $('lives').textContent=mission.phase==='laststand'?'—':String(mission.lives).padStart(2,'0');$('grenades').textContent=String(mission.player.grenades).padStart(2,'0');
  Array.from($('health').children).forEach((el,i)=>el.classList.toggle('empty',i>=mission.player.hp));
  const w=mission.player.weapon;$('weapon').textContent=w==='rifle'?'STANDARD RIFLE':`${w==='rapid'?'RAPID FIRE':'SPREAD SHOT'} · ${Math.ceil(mission.player.power)}s`;
  $('weapon-meter').style.width=w==='rifle'?'100%':`${mission.player.power/15*100}%`;
  const n=mission.sector();['JUNGLE','DEFENSIVE LINE','RIVER','PRISON CAMP','EXTRACTION'].forEach((s,i)=>{$(`route-${i}`).classList.toggle('active',i===n);$(`route-${i}`).classList.toggle('done',i<n);if(i===n)$('stage-label').textContent=mission.phase==='laststand'?'MISSION COMPLETE / LAST STAND':`SECTOR 0${i+1} / ${s}`;});
  document.querySelector('.field-note p').textContent=aimMode==='mouse'?'Move with the keyboard. Point the mouse where you want to fire. Grenades follow your aim.':'Your weapon follows your movement. Stop moving to hold your aim.';
  document.querySelector('.controls>div span').textContent=aimMode==='mouse'?'Move · mouse aims':'Move & aim';
  $('pause').textContent=mission.state==='paused'?'RESUME ▶':'PAUSE Ⅱ';
}
// Original, code-drawn pixel artwork. All world details use stable seeded positions.
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function line(x1,y1,x2,y2,c,width=1){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(x1),Math.round(y1));ctx.lineTo(Math.round(x2),Math.round(y2));ctx.stroke();}
function text(str,x,y,size=10,c='#e9e5c7',align='left'){ctx.fillStyle=c;ctx.font=`bold ${size}px "IBM Plex Mono",monospace`;ctx.textAlign=align;ctx.fillText(str,Math.round(x),Math.round(y));ctx.textAlign='left';}
function shadow(x,y,w=13,h=5){ctx.fillStyle='#071d1b66';ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y),w,h,0,0,Math.PI*2);ctx.fill();}
function leafCluster(x,y,size,seed){
  const r=random(seed);shadow(x+5,y+size*.3,size*.68,size*.3);
  for(let i=0;i<12;i++){const a=r()*Math.PI*2,d=r()*size*.7,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d,s=size*(.25+r()*.25);const colors=['#173b2b','#234b30','#305b37','#426c3e','#527544'];
    rect(px-s/2,py-s/2,s,s*.68,colors[i%5]);rect(px-s*.32,py-s*.66,s*.62,s*.32,colors[i%5]);rect(px-s*.22,py-s*.65,2,s*.6,'#60824a55');}
}
function palm(x,y,seed){
  shadow(x+10,y+20,26,10);line(x,y+24,x-5,y,'#49442d',5);line(x-1,y+24,x-6,y,'#7b6941',2);
  const r=random(seed);for(let i=0;i<7;i++){const a=i/7*Math.PI*2+r()*.2;const dx=Math.cos(a),dy=Math.sin(a);const c=i%2?'#456e3c':'#608348';
    line(x-5,y,x-5+dx*37,y+dy*20,c,5);for(let j=1;j<5;j++){line(x-5+dx*j*7,y+dy*j*4,x-5+dx*j*7-dy*8,y+dy*j*4+dx*6,c,2);}}
}
function terrain(){
  const camera=mission.camera;rect(0,0,WIDTH,HEIGHT,'#3c4e31');
  const first=Math.floor(camera/80);
  for(let row=first;row<=first+9;row++){
    const wy=row*80,y=wy-camera,depth=WORLD-wy,r=random(row*919+7);
    const river=depth>12000&&depth<18000,camp=depth>18000&&depth<24700;
    rect(0,y,480,81,river?'#365951':camp?'#555742':row%2?'#3b4d30':'#3e5032');
    if(river){
      for(let i=0;i<28;i++){const x=r()*480,yy=y+r()*80;line(x,yy,x+8+r()*14,yy,'#608073',1);}
      rect(141,y,198,81,'#353b2b');rect(150,y,180,81,'#776c47');
      for(let yy=y;yy<y+80;yy+=9){rect(152,yy,176,6,'#8b8056');line(160,yy+2,310,yy+2,'#9d8a5b');}
      rect(142,y,6,81,'#363e2e');rect(332,y,6,81,'#363e2e');
    } else {
      const center=240+Math.sin(wy/510)*38,width=camp?280:180;
      for(let j=0;j<8;j++){const cy=y+j*10;const w=width+Math.sin((wy+j*10)/77)*14;rect(center-w/2,cy,w,11,camp?'#6b694e':'#67634a');rect(center-w/2-8,cy,8,11,'#535a39');rect(center+w/2,cy,9,11,'#535a39');}
      for(let i=0;i<36;i++){const x=r()*480,yy=y+r()*80;rect(x,yy,1+r()*3,1+r()*2,['#7a7654','#273e29','#879062','#454b31'][i%4]);}
      if(row%5===0&&!camp){shadow(center+30,y+40,35,10);rect(center+2,y+32,48,7,'#485744');rect(center+10,y+39,43,6,'#526652');line(center+9,y+35,center+41,y+35,'#778974');}
      if(camp&&row%7===0){building(28,y+10,65,55);building(385,y+25,64,62);}
    }
    if(!river){
      for(let i=0;i<5;i++){const side=i%2,x=side?406+r()*70:r()*72;leafCluster(x,y+r()*80,27+r()*18,row*77+i);}
      if(row%3===0){palm(60,y+30,row);palm(420,y+55,row+1);}
    }
    if(camp){line(108,y,108,y+80,'#8b896866',1);line(372,y,372,y+80,'#8b896866',1);for(let j=0;j<80;j+=20){line(105,y+j,111,y+j+8,'#b4a677',1);line(369,y+j,375,y+j+8,'#b4a677',1);}}
  }
  // Prison gate, holding cells and evacuation pad are permanent landmarks.
  if(7100-camera>-180&&7100-camera<HEIGHT+180){
    const y=7115-camera;if(!mission.gateOpen){rect(178,y-10,124,13,'#30352a');for(let x=181;x<300;x+=12){rect(x,y-20,5,27,'#9a916a');line(x,y-20,x+12,y+7,'#6e7450',2);}text('DESTROY BOTH GUN POSITIONS',240,y+70,8,'#e4ce86','center');}
    else text('GATE OPEN',240,y+10,9,'#d3d4aa','center');
    building(23,y-65,67,60);building(390,y-65,67,60);
  }
  if(6000-camera>-180&&6000-camera<HEIGHT+180){
    const y=5990-camera;rect(175,y-60,130,82,'#333d2d');rect(181,y-53,118,68,'#5f6149');
    if(!mission.rescued){for(let i=0;i<4;i++)soldier(197+i*27,y-22,0,1,'prisoner',0);for(let x=177;x<305;x+=13)rect(x,y-60,3,82,'#999879');text('HOLDING CELLS',240,y+38,9,'#e8d9a0','center');}
    else text('PRISONERS FREED',240,y+38,9,'#d2dda9','center');
  }
  const py=640-camera;
  if(py>-180&&py<HEIGHT+180){
    rect(128,py-102,224,210,'#596046');ctx.strokeStyle='#cfcca077';ctx.lineWidth=3;ctx.strokeRect(141,py-90,198,187);
    rect(217,py-40,8,80,'#c0c198');rect(254,py-40,8,80,'#c0c198');rect(217,py-4,45,8,'#c0c198');
    text('LZ / ECHO',240,py+86,10,'#d8d8b3','center');
    for(const x of [128,348])for(const yy of [py-103,py+103]){rect(x,yy,4,4,'#e9c169');if(Math.sin(visualTime*5)>0)rect(x-2,yy-2,8,8,'#e9c16933');}
  }
}
function building(x,y,w,h){shadow(x+w/2,y+h,w*.65,8);rect(x,y,w,h,'#2a3528');rect(x+3,y+2,w-6,h-8,'#6d7350');for(let yy=y+5;yy<y+h-6;yy+=6)rect(x+4,yy,w-8,2,'#4e593e');rect(x+w/2-2,y,4,h-6,'#9a9766');rect(x-3,y-3,w+6,5,'#888b5f');}
function obstacle(o){const y=o.y-mission.camera;
  if(y<-60||y>HEIGHT+40)return;
  shadow(o.x+o.w/2,y+o.h,o.w*.58,7);
  if(o.type==='rock'){
    rect(o.x+6,y,o.w-12,o.h,'#4b5144');rect(o.x,y+7,o.w,o.h-10,'#656a55');rect(o.x+6,y+2,o.w-15,9,'#899079');rect(o.x+12,y+3,15,3,'#a3a58a');rect(o.x+o.w-14,y+9,8,o.h-9,'#394b3b');
  }else if(o.type==='wall'){rect(o.x,y,o.w,o.h,'#74725a');for(let yy=0;yy<o.h;yy+=9)for(let x=0;x<o.w;x+=22){rect(o.x+x,y+yy,20,7,'#929077');}}
  else {for(let row=0;row<2;row++)for(let x=0;x<o.w-4;x+=16){rect(o.x+x+(row%2)*3,y+row*8,15,8,'#847b53');rect(o.x+x+(row%2)*3+1,y+row*8,13,4,'#b5a576');rect(o.x+x+(row%2)*3+2,y+row*8+6,11,2,'#5b5b3c');}}
}
function soldier(...args){drawSoldier(ctx,...args);}
function jeep(e){
  const x=e.x,y=e.y-mission.camera;shadow(x+3,y+29,27,10);
  rect(x-23,y-26,8,18,'#142a24');rect(x+16,y-26,8,18,'#142a24');rect(x-23,y+13,8,18,'#142a24');rect(x+16,y+13,8,18,'#142a24');
  rect(x-17,y-32,34,66,'#2b3c2c');rect(x-15,y-29,30,60,e.hit?'#eee0b1':'#7b8051');rect(x-13,y-24,26,15,'#919164');
  for(let i=0;i<4;i++)rect(x-9+i*6,y-23,2,12,'#656f48');rect(x-14,y-7,28,4,'#b2b18b');rect(x-11,y-2,22,17,'#344b40');
  rect(x-14,y+19,28,10,'#5c6844');rect(x-19,y+32,38,4,'#2e3b2b');rect(x-14,y+30,5,3,'#dfa758');rect(x+9,y+30,5,3,'#dfa758');
  soldier(x,y+8,e.dx,e.dy,'gun',0);ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(e.dy,e.dx)+Math.PI/2);rect(-2,-26,5,24,'#202f27');rect(-3,-27,7,5,'#68705a');ctx.restore();
  if(e.hp<9||e.exploding){for(let i=0;i<3;i++){const t=(visualTime*18+i*12)%40;rect(x-6+Math.sin(t)*5,y-10-t,9+t/4,8+t/4,e.exploding?'#edb56c99':'#28372b99');}}
  if(e.exploding&&Math.sin(visualTime*30)>0){ctx.strokeStyle='#ffc674';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,62,0,Math.PI*2);ctx.stroke();}
}
function gun(e){const x=e.x,y=e.y-mission.camera;rect(x-15,y-9,30,28,'#3c4935');rect(x-18,y+12,36,8,'#a19664');soldier(x,y,e.dx,e.dy,'gun',0,e.hit>0);line(x-10,y+8,x+11,y+8,'#262f24',3);}
function pickup(p){if(p.taken)return;const x=p.x,y=p.y-mission.camera;if(y<-30||y>670)return;shadow(x,y+11,12,4);rect(x-10,y-10,20,20,'#313e2a');rect(x-9,y-9,18,17,p.type==='health'?'#d2c8a1':'#8c8654');rect(x-7,y-7,14,2,'#cfbd80');rect(x-10,y+7,20,3,'#4b5438');
  if(p.type==='health'){rect(x-2,y-5,4,12,'#af4b39');rect(x-6,y-1,12,4,'#af4b39');}
  else {text(p.type==='grenades'?'G':p.type==='rapid'?'R':'S',x,y+5,12,'#202e23','center');}
  if(Math.sin(visualTime*3)>0){rect(x-13,y-13,4,1,'#d9c987');rect(x+10,y+12,4,1,'#d9c987');}
}
function helicopter(){const h=mission.heli;if(['waiting','escaped'].includes(h.phase))return;const x=h.x,y=h.y-mission.camera;if(y<-220||y>HEIGHT+200)return;
  if(h.phase==='doomed'&&h.timer>3){for(let i=0;i<8;i++){const a=i*.78;rect(x+Math.cos(a)*h.timer*8,y+Math.sin(a)*h.timer*6,8,6,i%2?'#ffb851':'#374338');}return;}
  shadow(x+8,y+24,70,23);rect(x-7,y+30,14,58,'#657854');rect(x-24,y+74,48,6,'#829066');rect(x-16,y+19,32,29,'#485e43');rect(x-25,y-40,50,72,'#667b51');rect(x-18,y-54,36,22,'#7c8d5e');rect(x-13,y-51,26,16,'#283f3b');rect(x-11,y-48,10,8,'#5b8680');rect(x+3,y-48,8,8,'#5b8680');rect(x-20,y-26,40,48,'#829164');rect(x-25,y-8,8,22,'#1e352b');rect(x+17,y-8,8,22,'#1e352b');
  line(x-34,y-35,x-34,y+33,'#283c2c',4);line(x+34,y-35,x+34,y+33,'#283c2c',4);rect(x-6,y-5,12,12,'#2d422f');
  ctx.save();ctx.translate(x,y);ctx.rotate(visualTime*36);rect(-93,-3,186,6,'#abb39a99');rect(-3,-93,6,186,'#8e9d8499');ctx.restore();
  if(h.phase==='countdown'){
    rect(x+32,y-7,33,36,'#e3c46544');ctx.strokeStyle='#ebca75';ctx.lineWidth=1;ctx.strokeRect(x+32,y-7,33,36);
    text('BOARD',x+49,y+43,8,'#ffe293','center');if(h.boardHold)rect(x+32,y+31,33*h.boardHold/.8,3,'#ffe293');
  }
}
function render(){
  ctx.save();if(mission.shake){ctx.translate(Math.sin(visualTime*89)*mission.shake,Math.cos(visualTime*83)*mission.shake);}
  terrain();mission.obstacles.forEach(obstacle);mission.pickups.forEach(pickup);
  const visible=mission.enemies.filter(e=>!e.dead&&e.y>mission.camera-60&&e.y<mission.camera+HEIGHT+60).sort((a,b)=>a.y-b.y);
  for(const e of visible){if(e.spawn>0&&Math.floor(e.spawn*8)%2)continue;if(e.type==='jeep')jeep(e);else if(e.type==='gun')gun(e);else soldier(e.x,e.y-mission.camera,e.dx,e.dy,e.type,e.age*(e.type==='rush'?12:5),e.hit>0,e.type==='grenadier'&&(e.cool<.65||e.cool>3.8*mission.tuning().fire-.35));}
  for(const p of mission.prisoners)if(!p.boarded)soldier(p.x,p.y-mission.camera,0,-1,'prisoner',visualTime*8);
  helicopter();
  const p=mission.player;
  if(!p.hidden&&mission.state!=='dying'&&!(mission.state==='ended'&&p.hp<=0)&&!(p.inv>0&&Math.floor(p.inv*9)%2))soldier(p.x,p.y-mission.camera,p.dx,p.dy,'hero',p.step);
  if(mission.state==='playing'&&p.grenades>0){
    const x=clamp(p.x+p.dx*115,20,460),y=p.y+p.dy*115-mission.camera;
    ctx.strokeStyle='#e5d99566';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.stroke();line(x-10,y,x-4,y,'#e5d99588');line(x+4,y,x+10,y,'#e5d99588');line(x,y-10,x,y-4,'#e5d99588');line(x,y+4,x,y+10,'#e5d99588');
  }
  for(const b of mission.bullets){if(b.enemy){rect(b.x-3,b.y-mission.camera-3,6,6,'#c75b3888');rect(b.x-2,b.y-mission.camera-2,4,4,'#ffe298');rect(b.x-1,b.y-mission.camera-1,2,2,'#fff8d9');}else {line(b.x,b.y-mission.camera,b.x-b.dx*.02,b.y-mission.camera-b.dy*.02,'#ffe8a1',2);}}
  for(const g of mission.grenades){
    if(g.enemy){ctx.strokeStyle=Math.sin(visualTime*18)>0?'#efaa64':'#b96644';ctx.lineWidth=2;ctx.beginPath();ctx.arc(g.tx,g.ty-mission.camera,32,0,Math.PI*2);ctx.stroke();text('!',g.tx,g.ty-mission.camera+5,14,'#ffcc83','center');}
    const lift=Math.sin(g.t/g.duration*Math.PI)*42;shadow(g.x,g.y-mission.camera,4,2);rect(g.x-3,g.y-mission.camera-lift-4,6,8,g.enemy?'#cb864e':'#a8b377');rect(g.x-1,g.y-mission.camera-lift-6,3,3,'#e4d29a');
  }
  for(const q of mission.particles){ctx.globalAlpha=Math.min(1,q.life*2);rect(q.x,q.y-mission.camera,q.size,q.size,q.color);}ctx.globalAlpha=1;
  // Canopy shadows and soft edge vignette keep action in the visual foreground.
  const vignette=ctx.createRadialGradient(240,310,150,240,310,410);vignette.addColorStop(0,'#07150a00');vignette.addColorStop(1,'#06180c99');ctx.fillStyle=vignette;ctx.fillRect(0,0,480,640);
  ctx.restore();
  if(mission.state!=='title')drawHUD();
  // Subtle scanline texture, without blurring pixel art.
  for(let y=0;y<HEIGHT;y+=4)rect(0,y,WIDTH,1,'#0814090a');
}
function drawHUD(){
  rect(12,12,456,32,'#0b1b15dc');for(let i=0;i<3;i++){rect(22+i*16,23,12,9,i<mission.player.hp?'#b4c484':'#43543e');}
  text(`G ${String(mission.player.grenades).padStart(2,'0')}`,86,32,10,'#e8c976');text(mission.phase==='laststand'?'LAST STAND':`LIVES ${mission.lives}`,146,32,9,'#d6dcc0');
  text(String(Math.floor(mission.score)).padStart(6,'0'),455,32,12,'#f0d486','right');
  const h=mission.heli;
  if(h.phase==='countdown'){rect(116,58,248,41,'#1a251ce8');text(`TAKEOFF IN ${Math.ceil(h.timer)}`,240,83,20,'#f4cc6c','center');}
  else if(mission.phase==='laststand'){rect(125,58,230,28,'#14231be0');text(`HOLDOUT ${Math.floor(mission.finalTime)} SEC`,240,77,12,'#ecdba1','center');}
  else if(mission.phase==='extraction'&&h.phase==='loading'){text(`PRISONERS ABOARD ${h.boarded} / 4`,240,75,11,'#e7dba4','center');}
  if(mission.messageTime>0){const wide=mission.message.length>28;rect(25,HEIGHT-65,430,34,'#12251ce8');text(mission.message,240,HEIGHT-43,wide?9:12,'#e9d59a','center');}
  if(mission.state==='dying'){rect(95,270,290,74,'#0d1d16dd');text(mission.lives?'SOLDIER DOWN':'NO LIVES REMAINING',240,301,18,'#e6c17e','center');text(mission.lives?'REGROUPING AT CHECKPOINT':'',240,324,10,'#c5cdb0','center');}
  if(mission.player.power>0){text(`${mission.player.weapon.toUpperCase()} ${Math.ceil(mission.player.power)}s`,22,HEIGHT-14,9,'#edce7f');}
  const progress=clamp(mission.progress/(WORLD-620),0,1);rect(12,HEIGHT-5,456,2,'#283c2d');rect(12,HEIGHT-5,456*progress,2,'#9bae70');
}
function frame(now){
  const dt=Math.min((now-last)/1000,.04);last=now;visualTime+=dt;
  const controls=input();mission.update(dt,controls);sound.update(mission);render();uiClock+=dt;if(uiClock>.1){syncUI();uiClock=0;}
  requestAnimationFrame(frame);
}
syncUI();requestAnimationFrame(frame);


