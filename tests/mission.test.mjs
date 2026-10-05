import test from 'node:test';
import assert from 'node:assert/strict';
import {Mission,grenadeReward,WORLD} from '../engine.js';
const fresh=()=>{const m=new Mission();m.start();return m;};
test('grenade crates cap at ten and remain available when full',()=>{
  assert.equal(grenadeReward(8),10);assert.equal(grenadeReward(2),7);
  const m=fresh(),p={type:'grenades',taken:false};assert.equal(m.collect(p),false);assert.equal(p.taken,false);
  m.player.grenades=3;m.collect(p);assert.equal(m.player.grenades,8);assert.equal(p.taken,true);
});
test('checkpoint restores resources, enemies, score, prisoners and countdown without refunding a life',()=>{
  const m=fresh();m.player.y=3300;m.camera=3000;m.progress=WORLD-3300;m.rescued=true;m.prisoners=[{x:200,y:3400,boarded:false}];m.score=900;m.saveCheckpoint(3);
  m.score=2900;m.player.grenades=0;m.player.weapon='spread';m.player.power=8;m.heli.phase='countdown';m.heli.timer=2;m.prisoners[0].boarded=true;
  m.player.inv=0;m.player.hp=1;m.hitPlayer();assert.equal(m.lives,2);m.update(1.5);
  assert.equal(m.state,'playing');assert.equal(m.score,900);assert.equal(m.player.hp,3);assert.equal(m.player.grenades,10);assert.equal(m.player.weapon,'rifle');assert.equal(m.heli.phase,'waiting');assert.equal(m.prisoners[0].boarded,false);assert.equal(m.lives,2);
});
test('ten second takeoff countdown starts only after all four prisoners board',()=>{
  const m=fresh();m.rescued=true;m.phase='extraction';m.heli.phase='loading';m.heli.y=620;m.player.y=660;m.camera=250;
  m.prisoners=Array.from({length:4},(_,i)=>({x:220+i*14,y:700,boarded:false}));m.updateExtraction(0);
  assert.equal(m.heli.boarded,4);assert.equal(m.heli.phase,'countdown');assert.equal(m.heli.timer,10);
  m.updateExtraction(9.9);assert.equal(m.heli.phase,'countdown');m.updateExtraction(.11);assert.equal(m.heli.phase,'departing');
});
test('boarding is a terminal failure even with spare lives',()=>{
  const m=fresh();m.heli.phase='countdown';m.heli.timer=7;assert.equal(m.boardHelicopter(),true);assert.equal(m.state,'cinematic');
  m.update(5.3);assert.equal(m.state,'ended');assert.equal(m.ending,'boarded');assert.equal(m.lives,3);
});
test('doorway requires deliberate hold and leaving cancels it',()=>{
  const m=fresh();m.heli.phase='countdown';m.heli.x=240;m.heli.y=620;m.heli.timer=10;m.player.x=288;m.player.y=632;
  m.updateExtraction(.3);assert.equal(m.state,'playing');assert.ok(m.heli.boardHold>.2);m.player.x=240;m.updateExtraction(.1);assert.equal(m.heli.boardHold,0);
  m.player.x=288;m.updateExtraction(.81);assert.equal(m.state,'cinematic');
});
test('rescue success grants bonus once, removes supplies and ends on death without respawn',()=>{
  const m=fresh();m.heli.phase='departing';m.heli.timer=5.99;m.updateExtraction(.02);assert.equal(m.phase,'laststand');assert.equal(m.score,5000);assert.ok(m.pickups.every(p=>p.taken));
  m.updateExtraction(.1);assert.equal(m.score,5000);m.player.inv=0;m.player.hp=1;m.hitPlayer();assert.equal(m.state,'ended');assert.equal(m.ending,'success');assert.equal(m.lives,3);
});
test('own grenades spare player but vehicle explosions hurt and chain to nearby enemies',()=>{
  const m=fresh();m.player.inv=0;m.explode(m.player.x,m.player.y);assert.equal(m.player.hp,3);
  const e=m.enemy('rifle',m.player.x+30,m.player.y);m.explode(m.player.x,m.player.y,false,true);assert.equal(m.player.hp,2);assert.equal(e.dead,true);
});
test('one grenade or sustained rifle damage destroys jeep after warning',()=>{
  const m=fresh();const j=m.enemy('jeep',240,m.player.y-100);m.damageEnemy(j,15);assert.equal(j.hp,1);assert.ok(!j.exploding);m.damageEnemy(j,1);assert.ok(j.exploding);m.updateEnemies(.7);assert.equal(j.dead,true);assert.equal(m.score,500);
  const j2=m.enemy('jeep',100,m.player.y-100);m.explode(j2.x,j2.y);assert.ok(j2.exploding);
});
test('powerups replace and refresh, then expire to rifle',()=>{
  const m=fresh();m.collect({type:'rapid'});assert.equal(m.player.weapon,'rapid');m.player.power=3;m.collect({type:'spread'});assert.equal(m.player.weapon,'spread');assert.equal(m.player.power,15);m.update(15.1);assert.equal(m.player.weapon,'rifle');
});
test('camera never scrolls backward and gate blocks forward crossing until guns are destroyed',()=>{
  const m=fresh();m.player.y-=100;m.update(.02);const cam=m.camera;m.player.y+=50;m.update(.02);assert.equal(m.camera,cam);
  m.player.y=7145;m.camera=6800;assert.equal(m.blocked(240,7139),true);m.enemies.filter(e=>e.gate).forEach(e=>m.damageEnemy(e,10));m.update(.01);assert.equal(m.gateOpen,true);assert.equal(m.blocked(240,7139),false);
});
test('third death ends run; hit invulnerability prevents multiple hits at once',()=>{
  const m=fresh();m.player.inv=0;m.hitPlayer();m.hitPlayer();assert.equal(m.player.hp,2);
  for(let i=0;i<3;i++){m.player.hp=1;m.player.inv=0;m.hitPlayer();m.update(1.5);}
  assert.equal(m.lives,0);assert.equal(m.state,'ended');assert.equal(m.ending,'failed');
});
test('the complete map is traversable and rescue flows through loading, countdown and escape',()=>{
  const m=fresh();let elapsed=0;
  // Invulnerability isolates map/mission progression from player skill and combat balance.
  while(m.phase!=='laststand'&&elapsed<650){
    m.player.inv=100;
    if(m.player.y<7420)m.enemies.filter(e=>e.gate&&!e.dead).forEach(e=>m.damageEnemy(e,10));
    m.update(1/30,{y:m.player.y>530?-1:0});elapsed+=1/30;
  }
  assert.equal(m.phase,'laststand',`stalled at y=${m.player.y}, phase=${m.heli.phase}`);
  assert.equal(m.checkpointLevel,3);assert.equal(m.heli.boarded,4);assert.ok(m.rescued);assert.ok(elapsed>350&&elapsed<650);
});
test('mouse aim allows retreating while shooting forward; classic aim follows movement',()=>{
  const m=fresh(),oldY=m.player.y;m.update(.1,{y:1,aimX:240,aimY:oldY-200});assert.ok(m.player.y>oldY);assert.equal(m.player.dx,0);assert.equal(m.player.dy,-1);
  m.update(.1,{x:1});assert.equal(m.player.dx,1);assert.equal(m.player.dy,0);
  m.update(.1,{aimX:m.player.x-200,aimY:m.player.y});assert.equal(m.player.dx,-1);assert.equal(m.player.dy,0);
});
test('all difficulty levels preserve player resources and increase enemy pressure in order',()=>{
  const counts=[],speeds=[];
  for(const difficulty of ['easy','medium','hard','impossible']){
    const m=new Mission();m.start({difficulty});assert.equal(m.difficulty,difficulty);assert.equal(m.player.hp,3);assert.equal(m.player.grenades,10);assert.equal(m.lives,3);
    counts.push(m.enemies.length);m.shoot(10,10,0,1,true,77);speeds.push(m.bullets[0].dy);
    const old=m.player.y;m.update(.1,{y:-1});assert.ok(Math.abs(old-m.player.y-7.9)<.00001);
    m.restoreCheckpoint();assert.equal(m.difficulty,difficulty);
  }
  for(let i=1;i<4;i++){assert.ok(counts[i]>counts[i-1]);assert.ok(speeds[i]>speeds[i-1]);}
});
