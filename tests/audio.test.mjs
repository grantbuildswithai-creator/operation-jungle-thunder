import test from 'node:test';
import assert from 'node:assert/strict';
import {THEMES,Sound,themeForMission} from '../audio.js';
function instrument(){const s=new Sound();s.enabled=true;s.context={state:'running',currentTime:1};s.calls=[];s.tone=(...args)=>s.calls.push({kind:'tone',args});s.noise=(...args)=>s.calls.push({kind:'noise',args});return s;}
test('each checkpoint selects a distinct composition and extraction supersedes checkpoint music',()=>{
  const names=[0,1,2,3].map(checkpointLevel=>themeForMission({state:'playing',phase:'approach',checkpointLevel}));assert.equal(new Set(names).size,4);
  assert.equal(themeForMission({state:'playing',phase:'extraction',checkpointLevel:3}),'helicopter');
  assert.equal(themeForMission({state:'cinematic'}),'helicopter');
  assert.equal(themeForMission({state:'playing',phase:'laststand'}),'laststand');
});
test('rifle is silent while grenade throw and explosion retain their sounds',()=>{
  const s=instrument();s.event('shot');assert.equal(s.calls.length,0);
  s.event('throw');assert.deepEqual(s.calls[0].args,[350,.12,.025,'triangle',120]);
  s.event('explosion');assert.equal(s.calls[1].kind,'noise');assert.deepEqual(s.calls[1].args,[.5,.18,850]);assert.equal(s.calls[2].args[0],85);
});
test('music continues on results screens with different victory and defeat themes and finishes',()=>{
  for(const ending of ['success','boarded','failed']){
    const s=instrument(),m={state:'ended',ending};s.update(m);assert.equal(s.theme,ending==='success'?'victory':'defeat');assert.ok(s.calls.length>0);
    for(let i=0;i<2000;i++){s.context.currentTime+=.05;s.update(m);}
    assert.equal(s.step,THEMES[s.theme].roots.length*8);const n=s.calls.length;s.context.currentTime+=10;s.update(m);assert.equal(s.calls.length,n);
  }
});
test('pause cancels scheduled music and resume starts the appropriate cue',()=>{
  const s=instrument(),m={state:'playing',checkpointLevel:1};s.update(m);let stopped=0;s.voices.add({stop(){stopped++;}});
  s.update({...m,state:'paused'});assert.equal(stopped,1);assert.equal(s.theme,null);
  s.context.currentTime+=2;s.update(m);assert.equal(s.theme,'defensive');assert.ok(s.step>0);
});
test('mute and restarting a run cancel all pending sounds',()=>{
  const s=instrument();let stops=0;s.nodes.add({stop(){stops++;}});s.theme='victory';s.step=9;s.reset();assert.equal(stops,1);assert.equal(s.theme,null);assert.equal(s.step,0);
  s.nodes.add({stop(){stops++;}});s.enable(false);assert.equal(stops,2);assert.equal(s.enabled,false);
});
test('all theme notes schedule finite frequencies, durations, levels and times',()=>{
  const s=instrument();for(const theme of Object.values(THEMES))for(let i=0;i<theme.roots.length*8;i++)s.playStep(theme,i,1+i*60/theme.bpm/2);
  for(const call of s.calls){for(const arg of call.args)if(typeof arg==='number')assert.ok(Number.isFinite(arg)&&arg>=0);if(call.kind==='tone')assert.ok(call.args[0]>=20&&call.args[0]<10000);}
});
