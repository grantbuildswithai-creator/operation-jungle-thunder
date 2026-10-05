// Original eight-bar arcade compositions. Semitone motifs are relative to each key.
export const THEMES = {
  approach:{name:'Into the Valley',bpm:128,key:50,roots:[0,0,5,7,0,3,5,7],lead:[12,null,15,19,17,null,15,12,10,null,12,15,14,10,7,null],energy:.8},
  defensive:{name:'Break the Line',bpm:142,key:50,roots:[0,3,5,7,0,5,8,7],lead:[12,12,null,19,17,15,12,null,15,17,19,null,22,19,17,14],energy:1},
  camp:{name:'Prison Break',bpm:150,key:53,roots:[0,7,5,3,0,5,8,7],lead:[19,null,19,17,15,12,15,null,17,19,24,22,19,null,17,15],energy:1.05},
  extraction:{name:'Run to Echo',bpm:146,key:50,roots:[5,3,0,7,5,8,3,7],lead:[17,19,null,22,24,22,19,null,17,15,17,19,14,null,10,14],energy:1},
  helicopter:{name:'Ten Seconds to Lift',bpm:164,key:50,roots:[0,0,8,7,0,5,8,7],lead:[12,19,12,22,12,19,24,22,19,17,15,17,19,14,10,14],energy:1.15},
  laststand:{name:'Until the Last',bpm:88,key:50,roots:[0,3,5,0,8,5,7,0],lead:[12,null,null,15,null,null,19,null,17,null,null,15,12,null,null,null],energy:.4,quiet:true},
  victory:{name:'They Made It Home',bpm:112,key:53,roots:[0,5,7,0,9,5,7,0],lead:[12,null,16,19,24,null,23,19,21,null,19,16,17,19,24,null],energy:.7,major:true,ending:true},
  defeat:{name:'Signal Lost',bpm:78,key:50,roots:[0,8,5,0],lead:[19,null,null,17,15,null,null,14,12,null,null,10,7,null,null,null],energy:.38,quiet:true,ending:true}
};
export function themeForMission(m){
  if(m.state==='ended')return m.ending==='success'?'victory':'defeat';
  if(m.state==='cinematic')return 'helicopter';
  if(m.state!=='playing')return null;
  if(m.phase==='laststand')return 'laststand';
  if(m.phase==='extraction')return 'helicopter';
  return ['approach','defensive','camp','extraction'][Math.min(3,m.checkpointLevel||0)];
}
const hz = midi => 440 * 2 ** ((midi-69)/12);
export class Sound {
  constructor(onChange=()=>{}){this.enabled=false;this.context=null;this.onChange=onChange;this.theme=null;this.step=0;this.next=0;this.voices=new Set();this.nodes=new Set();}
  enable(value){
    this.enabled=value;
    if(value){try{
      if(!this.context){
        this.context=new (window.AudioContext||window.webkitAudioContext)();
        const c=this.context;this.master=c.createGain();this.master.gain.value=.75;
        this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-16;this.compressor.ratio.value=5;
        this.master.connect(this.compressor);this.compressor.connect(c.destination);
      }
      this.context.resume();this.theme=null;this.next=this.context.currentTime;
    }catch{this.enabled=false;}}
    else {this.stopAll();this.theme=null;}
    this.onChange(this.enabled);
  }
  track(source,music){
    this.nodes.add(source);if(music)this.voices.add(source);
    source.onended=()=>{this.nodes.delete(source);this.voices.delete(source);source.disconnect();};
  }
  stopMusic(){for(const v of this.voices){try{v.stop();}catch{}}this.voices.clear();}
  stopAll(){for(const v of this.nodes){try{v.stop();}catch{}}this.nodes.clear();this.voices.clear();}
  reset(){this.stopAll();this.theme=null;this.step=0;this.next=this.context?.currentTime||0;}
  tone(freq,duration,volume=.03,type='square',slide=0,when=null,music=false){
    if(!this.enabled||!this.context||this.context.state!=='running')return;
    const c=this.context,t=when??c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+duration);
    if(music){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume,t+.009);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*.45),t+duration*.6);g.gain.exponentialRampToValueAtTime(.0001,t+duration);}
    else {g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);}
    const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=music?2400:18000;
    o.connect(f);f.connect(g);g.connect(this.master);this.track(o,music);o.start(t);o.stop(t+duration);
  }
  noise(duration,volume,cutoff=1200,when=null,music=false){
    if(!this.enabled||!this.context||this.context.state!=='running')return;
    const c=this.context,t=when??c.currentTime,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=buffer;f.type='lowpass';f.frequency.value=cutoff;g.gain.value=volume;s.connect(f);f.connect(g);g.connect(this.master);this.track(s,music);s.start(t);s.stop(t+duration);
  }
  event(type){
    // Rifle shots are intentionally silent. Grenade throw and explosion sounds are preserved.
    if(type==='throw')this.tone(350,.12,.025,'triangle',120);
    if(type==='explosion'){this.noise(.5,.18,850);this.tone(85,.35,.065,'sine',25);}
    if(type==='hurt'){this.noise(.15,.08);this.tone(145,.2,.04,'sawtooth',50);}
    if(type==='pickup'||type==='checkpoint'){this.tone(660,.12,.035,'triangle');this.tone(880,.15,.035,'triangle',0,(this.context?.currentTime||0)+.08);}
    if(type==='jeep-warning')this.tone(220,.16,.04);
    if(type==='engine'){this.tone(65,.8,.035,'sawtooth',95);this.noise(.8,.035,250);}
    if(type==='success'){[440,554,660,880].forEach((n,i)=>this.tone(n,.6,.035,'triangle',0,(this.context?.currentTime||0)+i*.16));}
  }
  playStep(config,index,t){
    const eighth=60/config.bpm/2,bar=Math.floor(index/8),s=index%8,root=config.key+config.roots[bar%config.roots.length],gain=config.energy;
    const finalBar=config.ending&&bar===config.roots.length-1;
    if(finalBar){
      if(s===0){for(const n of [0,config.major?4:3,7,12])this.tone(hz(config.key+n),eighth*7.8,.027*gain,'triangle',0,t,true);}
      return;
    }
    // Bass ostinato, sustained harmony, melodic lead, and an answering arpeggio.
    if(!config.quiet||s%2===0)this.tone(hz(root-12+([0,0,7,0,12,7,0,7][s])),eighth*.85,.055*gain,'triangle',0,t,true);
    if(s===0){for(const n of [0,config.major?4:3,7])this.tone(hz(root+n),eighth*7.5,.012*gain,'triangle',0,t,true);}
    let note=config.lead[index%config.lead.length];
    if(note!==null){if(bar%4===3&&s>=4)note+=config.major?2:3;this.tone(hz(config.key+note),eighth*(config.quiet?2.4:.82),.033*gain,config.quiet?'triangle':'square',0,t,true);}
    if(!config.quiet&&s%2===1)this.tone(hz(root+24+[0,7,12,7][Math.floor(s/2)]),eighth*.6,.012*gain,'triangle',0,t,true);
    // A marching backbeat with small fills at phrase endings.
    if(!config.quiet){
      if(s===0||s===4||config===THEMES.helicopter&&s===6)this.tone(112,.14,.095*gain,'sine',32,t,true);
      if(s===2||s===6){this.noise(.11,.055*gain,2300,t,true);this.tone(175,.08,.024*gain,'triangle',80,t,true);}
      this.noise(.025,s%2?.011*gain:.007*gain,7000,t,true);
      if(bar%4===3&&s===7){this.noise(.06,.03*gain,1900,t,true);this.noise(.055,.025*gain,1900,t+eighth*.5,true);}
    }else if(s===0)this.tone(70,.25,.03,'sine',28,t,true);
  }
  update(mission){
    if(!this.enabled||!this.context||this.context.state!=='running')return;
    const name=themeForMission(mission),now=this.context.currentTime;
    if(name!==this.theme){this.stopMusic();this.theme=name;this.step=0;this.next=now+.025;}
    if(!name)return;
    const config=THEMES[name],total=config.roots.length*8;
    // Audio-clock scheduling avoids frame-rate-dependent music timing.
    if(this.next<now-.1)this.next=now+.025;
    while(this.next<now+.12){
      if(config.ending&&this.step>=total)return;
      this.playStep(config,this.step,this.next);
      if(name==='helicopter'&&this.step%2===0)this.noise(.065,.022,350,this.next,true);
      this.next+=60/config.bpm/2;this.step++;
    }
  }
}
