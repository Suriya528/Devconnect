import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Bot, Battery, WifiOff, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useHapticAudio from '../hooks/useHapticAudio';

const AIOrb = ({ forceCenter = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deviceState, setDeviceState] = useState({ 
    batteryLevel: 1, 
    isCharging: false, 
    isOffline: !navigator.onLine 
  });
  
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { playPop } = useHapticAudio();

  // Ambient Device Awareness (Battery & Network)
  useEffect(() => {
    // Network
    const handleOnline = () => setDeviceState(s => ({ ...s, isOffline: false }));
    const handleOffline = () => setDeviceState(s => ({ ...s, isOffline: true }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        const updateBattery = () => {
          setDeviceState(s => ({
            ...s,
            batteryLevel: battery.level,
            isCharging: battery.charging
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Conversational AI (Speech Synthesis)
  const speak = (text, callback) => {
    if (!('speechSynthesis' in window)) {
      if (callback) callback();
      return;
    }
    window.speechSynthesis.cancel(); // stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a futuristic/robotic voice if possible
    const voices = window.speechSynthesis.getVoices();
    const synthVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Samantha') || v.name.includes('Daniel')) || voices[0];
    if (synthVoice) utterance.voice = synthVoice;
    
    utterance.pitch = 0.9;
    utterance.rate = 1.05;
    
    if (callback) utterance.onend = callback;
    window.speechSynthesis.speak(utterance);
  };

  // Mouse tracking for Orb "looking" at cursor (rAF throttled for 60FPS)
  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e) => {
      if (forceCenter) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMousePos({
            x: (e.clientX / window.innerWidth - 0.5) * 20,
            y: (e.clientY / window.innerHeight - 0.5) * 20,
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [forceCenter]);

  useEffect(() => {
    if (forceCenter) setMousePos({ x: 0, y: 0 });
  }, [forceCenter]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      playPop();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      handleVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [playPop]);

  const handleVoiceCommand = (command) => {
    toast(`Heard: "${command}"`, { icon: '🗣️' });
    
    const routeAndSpeak = (path, message) => {
      speak(message, () => navigate(path));
    };
    
    if (command.includes('home')) {
      routeAndSpeak('/', "Taking you to the home page.");
    } else if (command.includes('profile')) {
      routeAndSpeak('/profile', "Accessing your profile data.");
    } else if (command.includes('dashboard')) {
      routeAndSpeak('/dashboard', "Welcome back to your dashboard, developer.");
    } else if (command.includes('feed')) {
      routeAndSpeak('/feed', "Loading the global feed.");
    } else if (command.includes('discover') || command.includes('search')) {
      routeAndSpeak('/search', "Initializing developer search protocol.");
    } else if (command.includes('login') || command.includes('sign in')) {
      routeAndSpeak('/login', "Please authenticate to continue.");
    } else if (command.includes('register') || command.includes('sign up')) {
      routeAndSpeak('/register', "Let's create your account.");
    } else {
      speak("I didn't quite catch that.");
      toast.error("Command not recognized.");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not supported.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Global hotkey 'V' to toggle voice
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e?.key && e.key.toLowerCase() === 'v' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

  // Determine Orb color based on device state
  let orbTheme = 'from-indigo-400 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-indigo-500';
  let StatusIcon = null;

  if (forceCenter) {
    orbTheme = 'from-white via-yellow-200 to-yellow-500 shadow-[0_0_100px_rgba(255,255,255,1)] bg-white';
  } else if (deviceState.isOffline) {
    orbTheme = 'from-gray-500 via-gray-700 to-gray-900 shadow-[0_0_30px_rgba(156,163,175,0.5)] bg-gray-500';
    StatusIcon = WifiOff;
  } else if (deviceState.isCharging) {
    orbTheme = 'from-green-400 via-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] bg-green-500';
    StatusIcon = Zap;
  } else if (deviceState.batteryLevel <= 0.2) {
    orbTheme = 'from-red-500 via-orange-600 to-red-900 shadow-[0_0_30px_rgba(239,68,68,0.5)] bg-red-600 animate-pulse';
    StatusIcon = Battery;
  }

  // Extract base colors for ring effects
  const baseColor = orbTheme.split(' ').find(c => c.startsWith('bg-')) || 'bg-indigo-500';
  const gradientColors = orbTheme.split(' ').filter(c => c.startsWith('from-') || c.startsWith('via-') || c.startsWith('to-')).join(' ');
  const shadowColor = orbTheme.split(' ').find(c => c.startsWith('shadow-')) || '';

  const containerClass = forceCenter 
    ? "flex flex-col items-center gap-2 transform scale-[2] pointer-events-auto" 
    : "fixed bottom-6 right-6 z-[99999] flex flex-col items-center gap-2 pointer-events-auto";

  return (
    <div className={containerClass}>
      
      {/* Tooltip hint */}
      <div className={`text-xs font-bold text-white/50 transition-opacity ${isListening ? 'opacity-100' : 'opacity-0'}`}>
        Listening...
      </div>

      {/* The Orb */}
      <button
        onClick={toggleListening}
        className="group relative w-16 h-16 rounded-full outline-none"
      >
        {/* Glow rings */}
        <div className={`absolute inset-0 rounded-full ${baseColor} transition-all duration-1000 ${isListening ? 'animate-ping opacity-40' : 'opacity-0'}`} />
        <div className={`absolute -inset-4 rounded-full ${baseColor}/20 blur-xl transition-all duration-500 ${isListening ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}`} />

        {/* Core */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${gradientColors} rounded-full ${shadowColor} overflow-hidden transition-all duration-300 ease-out`}
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        >
          {/* Glass reflection */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-md" />
          <div className="absolute top-1 left-2 w-4 h-4 bg-white/40 rounded-full blur-[2px]" />
          
          {/* Inner Eye / Mic */}
          <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-overlay">
            {isListening ? (
              <Mic className="animate-pulse w-8 h-8" />
            ) : StatusIcon ? (
              <StatusIcon className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Bot className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      </button>

      {/* Hotkey hint */}
      <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
        Press 'V'
      </div>
    </div>
  );
};

export default AIOrb;
