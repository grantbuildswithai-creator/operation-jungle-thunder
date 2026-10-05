export const WIDTH = 480, HEIGHT = 640, WORLD = 30000;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export function random(seed=1987) { return () => {seed = (seed * 1664525 + 1013904223) >>> 0;return seed / 4294967296;}; }
export function grenadeReward(current) {return Math.min(10,current+5);}
export const POINTS = {rifle:100,rush:150,grenadier:150,gun:300,jeep:500};
export const DIFFICULTIES = {
  easy:{count:.7,bullet:.78,fire:1.4,move:.85,wave:1.3},
  medium:{count:1,bullet:1,fire:1,move:1,wave:1},
  hard:{count:1.25,bullet:1.2,fire:.8,move:1.12,wave:.8},
  impossible:{count:1.6,bullet:1.48,fire:.58,move:1.28,wave:.6}
};
const clone = value => JSON.parse(JSON.stringify(value));
export class Mission {
  constructor() {this.listeners=[];this.difficulty='medium';this.reset();this.state='title';}
  event(type,data={}) {this.listeners.forEach(fn=>fn({type,...data}));}
  reset() {
    this.rng=random();this.time=0;this.score=0;this.lives=3;this.state='playing';this.phase='approach';
    this.player={x:240,y:WORLD-150,dx:0,dy:-1,hp:3,grenades:10,inv:2,fire:.3,weapon:'rifle',power:0,step:0};
    this.camera=WORLD-HEIGHT;this.progress=0;this.bullets=[];this.grenades=[];this.particles=[];this.enemies=[];this.obstacles=[];this.pickups=[];
    this.prisoners=[];this.rescued=false;this.gateOpen=false;this.checkpointLevel=0;this.kills=0;this.finalTime=0;this.waveTime=0;
    this.heli={x:240,y:-500,phase:'waiting',timer:0,boardHold:0,boarded:0};this.message='ENTER THE VALLEY';this.messageTime=4;this.shake=0;this.deathTimer=0;this.ending='';
    this.generate();this.saveCheckpoint(0);
  }
  start(options={}) {if(options.difficulty in DIFFICULTIES)this.difficulty=options.difficulty;this.reset();this.event('radio',{text:'“You’re in. Move north through the valley. Find our people.”'});}
  tuning() {return DIFFICULTIES[this.difficulty]||DIFFICULTIES.medium;}
  sector() {return Math.min(4,Math.floor(this.progress/6000));}
  enemy(type,x,y,extra={}) {
    const e={type,x,y,hp:type==='jeep'?16:type==='gun'?5:2,dx:0,dy:1,cool:1.2+this.rng()*1.6,age:0,hit:0,dead:false,burst:0,spawn:0,...extra};
    this.enemies.push(e);return e;
  }
  generate() {
    for(let depth=620;depth<26700;depth+=420+this.rng()*230){
      const y=WORLD-depth;const count=Math.max(1,Math.round((depth<4000?2:depth<16000?3:4)*this.tuning().count));
      for(let j=0;j<count;j++){
        let x=70+this.rng()*340;
        if(depth>12000&&depth<18000) x=160+this.rng()*160;
        const r=this.rng();const type=depth<2200?'rifle':r<.18?'rush':r<.32?'grenadier':'rifle';
        this.enemy(type,x,y-j*42);
      }
    }
    for(let depth=1200;depth<26800;depth+=650){
      if(depth>12000&&depth<18000) continue;
      const side=this.rng()<.5;const x=side?58+this.rng()*55:310+this.rng()*60;
      this.obstacles.push({x,y:WORLD-depth,w:50+this.rng()*35,h:24,type:this.rng()<.55?'sandbag':'rock'});
    }
    for(const depth of [4200,7600,10500,18900,21700,25900]){
      const x=depth%3?105:355;this.enemy('gun',x,WORLD-depth);
      this.obstacles.push({x:x-26,y:WORLD-depth+14,w:52,h:13,type:'sandbag'});
    }
    for(const depth of [3500,9200,15700,20400,26100])this.enemy('jeep',depth===15700?240:depth%3===0?140:340,WORLD-depth,{drive:1,driveTarget:WORLD-depth+100});
    // Camp gate positions must be destroyed before entering the prison.
    this.enemy('gun',174,7250,{gate:true});this.enemy('gun',306,7250,{gate:true});
    this.obstacles.push({x:32,y:7100,w:146,h:28,type:'wall'},{x:302,y:7100,w:146,h:28,type:'wall'});
    for(let depth=1900,i=0;depth<27800;depth+=1450,i++) {
      const type=i%4===0?'health':i%4===1?'grenades':i%4===2?'rapid':'spread';
      let x=i%2?135:345;if(depth>12000&&depth<18000)x=i%2?185:295;
      this.pickups.push({type,x,y:WORLD-depth,taken:false});
    }
    this.pickups.push({type:'grenades',x:165,y:1600,taken:false},{type:'health',x:315,y:1800,taken:false});
  }
  saveCheckpoint(level) {
    this.checkpointLevel=level;
    this.checkpoint=clone({level,player:this.player,camera:this.camera,progress:this.progress,score:this.score,kills:this.kills,time:this.time,enemies:this.enemies,obstacles:this.obstacles,pickups:this.pickups,rescued:this.rescued,gateOpen:this.gateOpen,prisoners:this.prisoners});
    if(level){this.announce('CHECKPOINT SECURED');this.event('checkpoint');}
  }
  restoreCheckpoint() {
    const s=clone(this.checkpoint);
    for(const key of ['player','camera','progress','score','kills','time','enemies','obstacles','pickups','rescued','gateOpen','prisoners'])this[key]=s[key];
    Object.assign(this.player,{hp:3,grenades:10,inv:3,weapon:'rifle',power:0,fire:.3});
    this.bullets=[];this.grenades=[];this.particles=[];this.phase='approach';this.state='playing';
    this.heli={x:240,y:-500,phase:'waiting',timer:0,boardHold:0,boarded:0};this.waveTime=0;this.finalTime=0;
    if(this.rescued)this.prisoners.forEach((p,i)=>Object.assign(p,{x:205+i*23,y:this.player.y+50+i*22,boarded:false}));
    this.announce('BACK IN THE FIGHT');this.event('radio',{text:'“Regroup at the checkpoint. Keep moving.”'});
  }
  announce(text,seconds=3) {this.message=text;this.messageTime=seconds;}
  blocked(x,y,r=8) {
    if(x<26||x>WIDTH-26||y<this.camera+20||y>this.camera+HEIGHT-18)return true;
    const depth=WORLD-y;
    if(depth>12000&&depth<18000&&(x<149||x>331))return true;
    if(!this.gateOpen&&y<7140&&this.player.y>=7140)return true;
    return this.obstacles.some(o=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h);
  }
  throwGrenade() {
    if(this.state!=='playing'||!this.player.grenades)return false;
    const p=this.player;p.grenades--;
    this.grenades.push({x:p.x,y:p.y,sx:p.x,sy:p.y,tx:clamp(p.x+p.dx*115,20,460),ty:p.y+p.dy*115,t:0,duration:.72,enemy:false});
    this.event('throw');return true;
  }
  shoot(x,y,dx,dy,enemy=false,speed=350) {
    if(enemy)speed*=this.tuning().bullet;
    this.bullets.push({x,y,dx:dx*speed,dy:dy*speed,enemy,life:enemy?6:1.5});
  }
  hitPlayer() {
    if(this.state!=='playing'||this.player.inv>0)return false;
    this.player.hp--;this.player.inv=1.8;this.shake=5;this.event('hurt');
    if(this.player.hp<=0){
      this.burst(this.player.x,this.player.y,'#d7aa68',20);
      if(this.phase==='laststand')this.finish(true);
      else {this.lives--;this.state='dying';this.deathTimer=1.4;}
    }
    return true;
  }
  damageEnemy(e,damage) {
    if(e.dead||e.exploding)return;
    e.hp-=damage;e.hit=.12;
    if(e.hp<=0){
      if(e.type==='jeep'){e.exploding=.65;this.event('jeep-warning');}
      else {e.dead=true;this.score+=POINTS[e.type];this.kills++;this.burst(e.x,e.y,'#ac8554',8);this.event('kill');}
    }
  }
  explode(x,y,enemy=false,vehicle=false) {
    this.burst(x,y,'#f7bd57',32);this.burst(x,y,'#594f37',18);this.shake=vehicle?7:4;this.event('explosion');
    if((enemy||vehicle)&&distance(this.player,{x,y})<62)this.hitPlayer();
    if(!enemy)for(const e of this.enemies)if(!e.dead&&distance(e,{x,y})<76)this.damageEnemy(e,e.type==='jeep'?16:8);
  }
  burst(x,y,color,n) {for(let i=0;i<n;i++){const a=this.rng()*Math.PI*2,s=12+this.rng()*72;this.particles.push({x,y,dx:Math.cos(a)*s,dy:Math.sin(a)*s,life:.3+this.rng()*.65,max:1,color,size:2+this.rng()*6});}}
  collect(item) {
    const p=this.player;if(item.taken)return false;
    if(item.type==='health'&&p.hp===3||item.type==='grenades'&&p.grenades===10)return false;
    item.taken=true;
    if(item.type==='health')p.hp=Math.min(3,p.hp+1);
    else if(item.type==='grenades')p.grenades=grenadeReward(p.grenades);
    else {p.weapon=item.type;p.power=15;}
    this.announce(item.type==='health'?'MEDICAL SUPPLIES':item.type==='grenades'?'+5 GRENADES':item.type==='rapid'?'RAPID FIRE / 15 SEC':'SPREAD SHOT / 15 SEC',1.6);this.event('pickup');return true;
  }
  boardHelicopter() {
    if(this.heli.phase!=='countdown'||this.state!=='playing')return false;
    this.heli.phase='doomed';this.heli.timer=0;this.state='cinematic';this.player.hidden=true;
    this.announce('EXTRACTING',2);this.event('radio',{text:'“Everyone aboard. Lifting off!”'});return true;
  }
  secureRescue() {
    this.heli.phase='escaped';this.phase='laststand';this.finalTime=0;this.score+=5000;
    this.pickups.forEach(p=>p.taken=true);
    this.announce('MISSION COMPLETE / PRISONERS SECURED',6);
    this.event('success');this.event('radio',{text:'“We’re clear. You got them out.”'});
  }
  finish(success) {
    this.state='ended';this.ending=success?'success':this.heli.phase==='doomed'?'boarded':'failed';
    this.event('end',{success,ending:this.ending,score:Math.floor(this.score),finalTime:this.finalTime,kills:this.kills});
  }
  update(dt,input={}) {
    if(this.state==='paused'||this.state==='title'||this.state==='ended')return;
    this.time+=dt;this.messageTime=Math.max(0,this.messageTime-dt);this.shake=Math.max(0,this.shake-dt*12);
    this.particles=this.particles.filter(p=>{p.life-=dt;p.x+=p.dx*dt;p.y+=p.dy*dt;return p.life>0;});
    if(this.state==='dying'){this.deathTimer-=dt;if(this.deathTimer<=0){if(this.lives>0)this.restoreCheckpoint();else this.finish(false);}return;}
    if(this.state==='cinematic'){
      this.heli.timer+=dt;this.heli.y-=dt*48;this.heli.x+=dt*5;
      if(this.heli.timer>3&&this.heli.timer-dt<=3){this.explode(this.heli.x,this.heli.y,false,true);this.announce('AIRCRAFT DOWN',3);this.event('radio',{text:'“Taking fire! We’ve lost—”'});}
      if(this.heli.timer>5.2)this.finish(false);return;
    }
    const p=this.player;p.inv=Math.max(0,p.inv-dt);p.power=Math.max(0,p.power-dt);if(p.power===0)p.weapon='rifle';
    let ix=Math.sign(input.x||0),iy=Math.sign(input.y||0);
    if(ix||iy){const len=Math.hypot(ix,iy),mx=ix/len,my=iy/len;p.dx=mx;p.dy=my;
      const nx=p.x+mx*79*dt,ny=p.y+my*79*dt;
      if(!this.blocked(nx,p.y))p.x=nx;if(!this.blocked(p.x,ny))p.y=ny;p.step+=dt*12;
    }
    if(Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)){
      const ax=input.aimX-p.x,ay=input.aimY-p.y,len=Math.hypot(ax,ay);if(len>5){p.dx=ax/len;p.dy=ay/len;}
    }
    this.camera=Math.max(0,Math.min(this.camera,p.y-HEIGHT*.64));
    this.progress=Math.max(this.progress,WORLD-p.y);
    p.fire-=dt;
    if(p.fire<=0){
      p.fire=p.weapon==='rapid'?.105:.21;
      const a=Math.atan2(p.dy,p.dx);const angles=p.weapon==='spread'?[-.19,0,.19]:[0];
      angles.forEach(d=>this.shoot(p.x+p.dx*13,p.y+p.dy*13,Math.cos(a+d),Math.sin(a+d)));
      this.event('shot');
    }
    if(input.grenade)this.throwGrenade();
    if(this.checkpointLevel===0&&this.progress>5900)this.saveCheckpoint(1);
    if(this.checkpointLevel===1&&this.progress>17900)this.saveCheckpoint(2);
    if(this.checkpointLevel===2&&this.progress>26600&&this.rescued)this.saveCheckpoint(3);
    if(!this.gateOpen&&!this.enemies.some(e=>e.gate&&!e.dead)){this.gateOpen=true;this.announce('PRISON DEFENSES CLEARED');this.event('radio',{text:'“The gate is open. Get to the holding cells.”'});}
    if(!this.rescued&&this.gateOpen&&p.y<6100){
      this.rescued=true;this.prisoners=Array.from({length:4},(_,i)=>({x:195+i*28,y:6020+i*20,boarded:false}));
      this.announce('4 PRISONERS FREED');this.event('radio',{text:'“We’ve got all four. Lead them north to the landing zone.”'});
    }
    for(const item of this.pickups)if(!item.taken&&distance(item,p)<22)this.collect(item);
    this.updateEnemies(dt);this.updateProjectiles(dt);
    if(this.state!=='playing')return;
    this.updateExtraction(dt);
    if(this.phase==='laststand'){this.finalTime+=dt;this.score+=100*dt;}
  }
  updateEnemies(dt) {
    const p=this.player;
    for(const e of this.enemies){
      if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);
      if(e.exploding){e.exploding-=dt;if(e.exploding<=0){e.exploding=0;e.dead=true;this.score+=500;this.kills++;this.explode(e.x,e.y,false,true);}continue;}
      if(e.y<this.camera-65||e.y>this.camera+HEIGHT+90)continue;
      e.age+=dt;e.spawn=Math.max(0,e.spawn-dt);if(e.spawn>0)continue;
      const d=distance(e,p),a=Math.atan2(p.y-e.y,p.x-e.x);e.dx=Math.cos(a);e.dy=Math.sin(a);
      if(e.type==='jeep'&&e.drive){if(!e.engineStarted){e.engineStarted=true;this.event('engine');}e.y+=55*dt;if(e.y>=e.driveTarget)e.drive=0;continue;}
      if(e.type==='rush'||e.type==='rifle'&&d>175){
        const speed=(e.type==='rush'?39:17)*this.tuning().move;
        const nx=e.x+e.dx*speed*dt,ny=e.y+e.dy*speed*dt;
        const solid=this.obstacles.some(o=>nx>o.x-8&&nx<o.x+o.w+8&&ny>o.y-8&&ny<o.y+o.h+8);
        if(!solid){e.x=clamp(nx,30,450);e.y=ny;}
      }
      if(d<17)this.hitPlayer();
      e.cool-=dt;
      if(e.cool<=0&&d<460&&e.y>this.camera+8){
        if(e.type==='grenadier'){
          e.cool=3.8*this.tuning().fire;this.grenades.push({x:e.x,y:e.y,sx:e.x,sy:e.y,tx:p.x,ty:p.y,t:0,duration:1.65,enemy:true});
        }else if(e.type==='gun'||e.type==='jeep'){
          if(!e.burst){e.burst=4;e.aim=a;}
          const muzzle=e.type==='gun'?40:27;
          this.shoot(e.x+Math.cos(e.aim)*muzzle,e.y+Math.sin(e.aim)*muzzle,Math.cos(e.aim),Math.sin(e.aim),true,92);
          e.burst--;e.cool=e.burst?.19:2.4*this.tuning().fire;
        }else {this.shoot(e.x+e.dx*13,e.y+e.dy*13,e.dx,e.dy,true,77);e.cool=(e.type==='rush'?3.1:2.3+this.rng()*.9)*this.tuning().fire;}
      }
    }
  }
  updateProjectiles(dt) {
    for(const b of this.bullets){
      b.life-=dt;const steps=Math.max(1,Math.ceil(Math.hypot(b.dx,b.dy)*dt/5));
      for(let i=0;i<steps&&b.life>0;i++){
        b.x+=b.dx*dt/steps;b.y+=b.dy*dt/steps;
        if(b.x<0||b.x>WIDTH||b.y<this.camera-50||b.y>this.camera+HEIGHT+50){b.life=0;break;}
        if(this.obstacles.some(o=>b.x>o.x&&b.x<o.x+o.w&&b.y>o.y&&b.y<o.y+o.h)){b.life=0;this.burst(b.x,b.y,'#a99d65',2);break;}
        if(b.enemy){if(distance(b,this.player)<8){b.life=0;this.hitPlayer();}}
        else {const e=this.enemies.find(e=>!e.dead&&!e.exploding&&distance(b,e)<(e.type==='jeep'?23:e.type==='gun'?13:11));if(e){b.life=0;this.damageEnemy(e,1);}}
      }
    }
    this.bullets=this.bullets.filter(b=>b.life>0);
    for(const g of this.grenades){
      g.t+=dt;const k=Math.min(1,g.t/g.duration);g.x=g.sx+(g.tx-g.sx)*k;g.y=g.sy+(g.ty-g.sy)*k;
      if(g.t>=g.duration){this.explode(g.tx,g.ty,g.enemy);g.dead=true;}
    }
    this.grenades=this.grenades.filter(g=>!g.dead);
  }
  updateExtraction(dt) {
    const h=this.heli,p=this.player;
    for(const [i,prisoner] of this.prisoners.entries()){
      if(prisoner.boarded)continue;
      const tx=218+i*14,ty=Math.max(680,p.y+55+i*20);
      const a=Math.atan2(ty-prisoner.y,tx-prisoner.x),d=distance(prisoner,{x:tx,y:ty});
      if(d>5){prisoner.x+=Math.cos(a)*83*dt;prisoner.y+=Math.sin(a)*83*dt;}
      if(h.phase==='loading'&&prisoner.y<720){prisoner.boarded=true;h.boarded++;this.event('pickup');}
    }
    if(this.rescued&&p.y<1450&&h.phase==='waiting'){
      h.phase='arriving';h.y=this.camera-200;h.timer=0;this.phase='extraction';this.waveTime=1;
      this.event('radio',{text:'“Bird inbound. Bring the prisoners to the marked landing pad.”'});this.announce('SECURE THE LANDING ZONE',4);
    }
    if(h.phase==='arriving'){h.y+=100*dt;if(h.y>=620){h.y=620;h.phase='loading';}}
    if(h.phase==='loading'&&h.boarded===4){h.phase='countdown';h.timer=10;this.announce('ALL ABOARD / TAKEOFF IN 10',3);this.event('radio',{text:'“All four aboard! Ten seconds! Door’s open—move!”'});}
    if(h.phase==='countdown'){
      h.timer=Math.max(0,h.timer-dt);
      // Holding in the marked doorway for 0.8 seconds is an intentional boarding choice.
      if(distance(p,{x:h.x+48,y:h.y+12})<19){h.boardHold+=dt;if(h.boardHold>=.8){this.boardHelicopter();return;}}
      else h.boardHold=0;
      if(h.timer<=0){h.phase='departing';h.timer=0;this.event('radio',{text:'“Keep them off us—we’re lifting!”'});this.announce('COVER THE HELICOPTER',4);}
    }
    if(h.phase==='departing'){h.timer+=dt;h.y-=82*dt;h.x-=4*dt;if(h.timer>=6)this.secureRescue();}
    if(this.phase==='extraction'||this.phase==='laststand'){
      this.waveTime-=dt;
      if(this.waveTime<=0){
        const final=this.phase==='laststand',t=this.finalTime;
        this.waveTime=(final?Math.max(.55,3.8-t*.045):4.2)*this.tuning().wave;
        const count=Math.max(1,Math.round((final?Math.min(6,2+Math.floor(t/22)):2)*this.tuning().count));
        for(let i=0;i<count;i++){
          if(this.enemies.filter(e=>!e.dead&&e.y>=this.camera-80&&e.y<=this.camera+700).length>100)break;
          const side=this.rng()<.5;let x=side?34:446,y=this.camera+50+this.rng()*500;
          if(distance({x,y},p)<115)y=this.camera+(p.y-this.camera<320?570:55);
          this.enemy(this.rng()<.3?'rush':this.rng()<.2?'grenadier':'rifle',x,y,{spawn:1.1});
        }
      }
    }
  }
}
