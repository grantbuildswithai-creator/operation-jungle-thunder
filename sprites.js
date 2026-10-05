// Original pixel sprites, shared by the battlefield and the character reference sheet.
export function drawSoldier(ctx,x,y,dx,dy,type,step,hit=false,throwing=false){
  const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const hero=type==='hero',prisoner=type==='prisoner',rush=type==='rush',grenadier=type==='grenadier';
  ctx.fillStyle='#071d1b77';ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y+10),hero?14:grenadier?12:10,5,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(Math.atan2(dy,dx)+Math.PI/2);
  const stride=Math.sin(step)*2;
  if(hero){
    // Broad bare shoulders, open black vest, long dark hair and a trailing red bandanna.
    rect(-8,3,7,11+stride,'#35462c');rect(2,3,7,11-stride,'#465734');
    rect(-7,5,3,6,'#75834a');rect(3,8,5,3,'#253828');
    rect(-8,12+stride,7,4,'#171c19');rect(2,12-stride,7,4,'#171c19');
    rect(-11,-7,22,16,'#151c19');rect(-10,-6,20,14,'#b68453');
    rect(-14,-6,6,12,'#b47b4d');rect(9,-6,6,12,'#c6915b');
    rect(-14,-7,6,5,'#e0b07a');rect(9,-7,6,5,'#edbc83');
    rect(-14,0,3,5,'#e0a670');rect(12,0,3,6,'#e5ab75');
    rect(-10,-5,5,13,'#242720');rect(5,-5,5,13,'#30342a');
    rect(-8,-4,2,10,'#50503a');rect(6,-4,2,10,'#5c5940');
    rect(-3,-4,6,10,'#dfaa70');rect(-1,1,2,4,'#a97048');
    // Cartridge bandolier across the torso.
    for(let i=0;i<5;i++){rect(-7+i*3,-3+i*2,4,3,'#342e20');rect(-6+i*3,-3+i*2,2,2,'#e4c17d');}
    rect(-10,7,20,3,'#343526');rect(-2,7,4,3,'#b6a36e');
    // Larger steel rifle and wooden grip.
    rect(8,-20,4,22,'#1c2724');rect(7,-13,6,9,'#677167');rect(9,-23,2,7,'#b6bbb0');rect(7,-3,5,6,'#86623e');
    // Hair frames the head without obscuring the red bandanna.
    rect(-7,-14,14,12,'#201e19');rect(-8,-8,4,10,'#2e271c');rect(5,-8,4,11,'#2e271c');
    rect(-5,-11,10,9,'#d9a574');rect(-3,-12,6,3,'#ecc193');rect(-4,-4,8,2,'#946440');
    rect(-7,-11,14,4,'#e23e32');rect(-6,-11,12,1,'#ff7860');
    const flutter=Math.round(Math.sin(step*.7)*2);
    rect(6,-8,8,3,'#c72d2a');rect(12,-6,3,8+flutter,'#e34332');rect(15,flutter,3,6,'#a82425');
  }else if(grenadier){
    // Black uniform, squared armored shoulders, bright grenade bandolier; no rifle.
    rect(-7,3,6,11+stride,'#171d24');rect(2,3,6,11-stride,'#222932');
    rect(-7,12+stride,6,4,'#0d1217');rect(2,12-stride,6,4,'#0d1217');
    rect(-11,-6,22,16,'#080f16');rect(-10,-5,20,13,'#242c36');
    rect(-11,-6,7,5,'#586371');rect(5,-6,7,5,'#586371');rect(-8,-5,16,2,'#7e8991');
    rect(-7,-2,14,10,'#151d26');rect(-7,7,14,3,'#4a5254');
    for(let i=0;i<3;i++){rect(-6+i*5,-1+i*2,4,5,'#b0c265');rect(-5+i*5,-2+i*2,2,2,'#e6dbaa');}
    rect(-13,-1,4,10,'#323a43');rect(-13,7,4,4,'#c29570');
    if(throwing){rect(10,-14,5,14,'#47515e');rect(10,-17,5,6,'#ddb187');rect(9,-22,7,7,'#bdd66d');rect(11,-24,3,3,'#e6db9b');}
    else {rect(10,-1,5,10,'#323a43');rect(11,5,4,5,'#c29570');rect(10,7,6,6,'#acc260');rect(12,5,2,3,'#e6db9b');}
    rect(-5,-12,10,10,'#bc916b');rect(-6,-14,12,7,'#151c25');rect(-5,-14,10,2,'#74818d');rect(-7,-9,14,3,'#303b48');
  }else{
    const uniform=prisoner?'#859ea1':rush?'#92654e':type==='gun'?'#536c3b':'#69934b';
    rect(-6,4,5,8+stride,'#35482b');rect(2,4,5,8-stride,'#35482b');rect(-6,10+stride,5,3,'#17231d');rect(2,10-stride,5,3,'#17231d');
    rect(-8,-5,16,13,uniform);rect(-5,-1,10,9,prisoner?'#647c7f':rush?'#665142':'#426534');
    rect(-9,-4,4,9,prisoner?'#859ea1':uniform);rect(6,-4,4,9,prisoner?'#859ea1':uniform);rect(-9,3,4,3,'#d0a47a');rect(6,3,4,3,'#bc9269');
    if(!prisoner){rect(5,-16,3,17,'#14241c');rect(4,-13,5,5,'#727a65');rect(6,-19,2,5,'#b0b59e');rect(-5,1,3,4,'#9ba368');}
    rect(-5,-10,10,9,'#d5ab7f');rect(-3,-11,7,2,'#ecbf8c');rect(-5,-4,10,2,'#916a4d');
    if(!prisoner&&!rush){rect(-6,-13,12,7,'#486c35');rect(-7,-8,14,2,'#284523');rect(-4,-13,8,2,'#a0b877');rect(-5,-11,3,2,'#77934f');}
  }
  if(hit){ctx.globalAlpha=.5;rect(-8,-8,16,16,'#fff2c6');ctx.globalAlpha=1;}
  ctx.restore();
}
