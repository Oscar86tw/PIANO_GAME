
(function(){
  let midiAccess=null;
  let micStream=null, micSource=null, analyser=null, micCtx=null, micRaf=null;
  let micRunning=false, lastEmitMidi=null, lastEmitAt=0, stableMidi=null, stableFrames=0;

  function emitNote(midi,velocity=1,source='unknown',extra={}){
    const note=AudioEngine.midiToNote(midi);
    Events.emit('input:note',{
      midi,note,velocity,source,
      at:performance.now(),
      ...extra
    });
  }

  function attachMidiInputs(){
    if(!midiAccess)return;
    for(const input of midiAccess.inputs.values()){
      input.onmidimessage=e=>{
        const [status,note,velocity]=e.data;
        const type=status&0xf0;
        if(type===0x90&&velocity>0){
          emitNote(note,velocity/127,'midi',{device:input.name||'MIDI'});
        }
      };
    }
    Events.emit('input:status',{source:'midi',connected:[...midiAccess.inputs.values()].length});
  }

  async function connectMIDI(){
    if(!navigator.requestMIDIAccess)throw new Error('此瀏覽器不支援 Web MIDI');
    midiAccess=await navigator.requestMIDIAccess({sysex:false});
    midiAccess.onstatechange=attachMidiInputs;
    attachMidiInputs();
    return [...midiAccess.inputs.values()].map(x=>x.name||'MIDI');
  }

  function autoCorrelate(buf,sampleRate){
    let size=buf.length,rms=0;
    for(let i=0;i<size;i++)rms+=buf[i]*buf[i];
    rms=Math.sqrt(rms/size);
    if(rms<0.018)return {freq:-1,rms};

    let r1=0,r2=size-1,thres=.2;
    for(let i=0;i<size/2;i++){if(Math.abs(buf[i])<thres){r1=i;break}}
    for(let i=1;i<size/2;i++){if(Math.abs(buf[size-i])<thres){r2=size-i;break}}
    const data=buf.slice(r1,r2);size=data.length;
    const c=new Array(size).fill(0);
    for(let i=0;i<size;i++){
      for(let j=0;j<size-i;j++)c[i]+=data[j]*data[j+i];
    }
    let d=0;
    while(d+1<size&&c[d]>c[d+1])d++;
    let max=-1,maxpos=-1;
    for(let i=d;i<size;i++){if(c[i]>max){max=c[i];maxpos=i}}
    if(maxpos<=0)return {freq:-1,rms};
    let T0=maxpos;
    const x1=c[T0-1]||c[T0],x2=c[T0],x3=c[T0+1]||c[T0];
    const a=(x1+x3-2*x2)/2,b=(x3-x1)/2;
    if(a)T0=T0-b/(2*a);
    return {freq:sampleRate/T0,rms};
  }

  function micLoop(){
    if(!micRunning||!analyser)return;
    const buf=new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    const {freq,rms}=autoCorrelate(buf,micCtx.sampleRate);

    if(freq>55&&freq<1800){
      const midi=AudioEngine.freqToMidi(freq);
      if(midi===stableMidi)stableFrames++;
      else{stableMidi=midi;stableFrames=1}

      const now=performance.now();
      if(stableFrames>=3 && (midi!==lastEmitMidi || now-lastEmitAt>450)){
        lastEmitMidi=midi;lastEmitAt=now;
        emitNote(midi,Math.min(1,Math.max(.1,rms*7)),'microphone',{frequency:+freq.toFixed(1)});
      }
      Events.emit('input:pitch-live',{midi,note:AudioEngine.midiToNote(midi),frequency:freq,rms});
    }else{
      stableFrames=0;stableMidi=null;
    }
    micRaf=requestAnimationFrame(micLoop);
  }

  async function startMicrophone(){
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('瀏覽器不支援麥克風輸入');
    micStream=await navigator.mediaDevices.getUserMedia({
      audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},
      video:false
    });
    micCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(micCtx.state==='suspended')await micCtx.resume();
    micSource=micCtx.createMediaStreamSource(micStream);
    analyser=micCtx.createAnalyser();
    analyser.fftSize=2048;
    analyser.smoothingTimeConstant=.05;
    micSource.connect(analyser);
    micRunning=true;
    micLoop();
    Events.emit('input:status',{source:'microphone',connected:1});
    return true;
  }

  async function stopMicrophone(){
    micRunning=false;
    if(micRaf)cancelAnimationFrame(micRaf);
    micStream?.getTracks?.().forEach(t=>t.stop());
    try{await micCtx?.close?.()}catch(e){}
    micStream=micSource=analyser=micCtx=null;
    Events.emit('input:status',{source:'microphone',connected:0});
  }

  window.InputEngine={
    connectMIDI,startMicrophone,stopMicrophone,
    emitVirtual(note,velocity=.85){emitNote(AudioEngine.noteToMidi(note),velocity,'virtual')},
    status:()=>({
      midi:!!midiAccess,
      midiInputs:midiAccess?[...midiAccess.inputs.values()].length:0,
      microphone:micRunning
    })
  };
})();
