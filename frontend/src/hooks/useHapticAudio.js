import { useRef, useCallback, useEffect } from 'react';

const useHapticAudio = () => {
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playSound = useCallback((type, clientX = null) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Spatial Panning
    let panner = null;
    if (clientX !== null && ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      // Convert screen X to -1.0 to 1.0 pan value
      const panValue = (clientX / window.innerWidth) * 2 - 1;
      panner.pan.setValueAtTime(panValue, ctx.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(ctx.destination);
    } else {
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
    }

    if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.02);
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.02);
      
      // Physical haptic (tick is very short)
      if (navigator.vibrate) navigator.vibrate(10);
    } 
    else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
      
      // Physical haptic (pop is slightly longer/stronger)
      if (navigator.vibrate) navigator.vibrate(25);
    } 
    else if (type === 'bassdrop') {
      osc.type = 'sawtooth';
      
      // Deep bass slide down
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);
      
      // Add a lowpass filter to make it sound muffled and heavy
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      // Rewire graph to include filter
      osc.disconnect();
      osc.connect(filter);
      
      if (panner) {
        filter.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(ctx.destination);
      } else {
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
      }
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
      
      // Physical haptic (heavy prolonged shake)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    }
    else if (type === 'ascend_chime') {
      osc.type = 'sine';
      
      // Holy glowing chord
      const freqs = [440, 554.37, 659.25, 880]; // A Major chord
      
      freqs.forEach(freq => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5);
        
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 5);
      });
      
      if (navigator.vibrate) navigator.vibrate([500]);
    }
  }, []);

  const startCathedralDrone = () => {
    const ctx = getContext();
    if (!ctx) return;
    
    // Create an ambient, shifting drone
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 5);
    droneGain.connect(ctx.destination);
    
    // Multiple low frequency sine/triangle waves beating against each other
    const freqs = [55, 55.5, 110, 111]; 
    const oscs = [];
    
    freqs.forEach(freq => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq;
      o.connect(droneGain);
      o.start();
      oscs.push(o);
    });
    
    // Store in window so we can stop it if needed
    window._cathedralDrone = { oscs, gain: droneGain };
  };

  const stopCathedralDrone = () => {
    if (window._cathedralDrone) {
      const { oscs, gain } = window._cathedralDrone;
      gain.gain.linearRampToValueAtTime(0, getContext().currentTime + 2);
      setTimeout(() => {
        oscs.forEach(o => o.stop());
      }, 2000);
      window._cathedralDrone = null;
    }
  };

  return {
    playTick: (e) => playSound('tick', e?.clientX),
    playPop: (e) => playSound('pop', e?.clientX),
    playBassDrop: () => playSound('bassdrop'),
    playAscendChime: () => playSound('ascend_chime'),
    startCathedralDrone,
    stopCathedralDrone
  };
};

export default useHapticAudio;
