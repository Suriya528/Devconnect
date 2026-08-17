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
  }, []);

  return {
    playTick: (e) => playSound('tick', e?.clientX),
    playPop: (e) => playSound('pop', e?.clientX),
    playBassDrop: () => playSound('bassdrop')
  };
};

export default useHapticAudio;
