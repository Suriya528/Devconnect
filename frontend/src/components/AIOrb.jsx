import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Bot } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useHapticAudio from '../hooks/useHapticAudio';

const AIOrb = () => {
  const [isListening, setIsListening] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { playPop } = useHapticAudio();

  // Mouse tracking for Orb "looking" at cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    
    if (command.includes('home')) {
      navigate('/');
    } else if (command.includes('profile')) {
      navigate('/profile');
    } else if (command.includes('dashboard')) {
      navigate('/dashboard');
    } else if (command.includes('feed')) {
      navigate('/feed');
    } else if (command.includes('discover') || command.includes('search')) {
      navigate('/search');
    } else if (command.includes('login') || command.includes('sign in')) {
      navigate('/login');
    } else if (command.includes('register') || command.includes('sign up')) {
      navigate('/register');
    } else {
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
      // Don't trigger if typing in an input
      if (e.key.toLowerCase() === 'v' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col items-center gap-2">
      
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
        <div className={`absolute inset-0 rounded-full bg-indigo-500 transition-all duration-1000 ${isListening ? 'animate-ping opacity-40' : 'opacity-0'}`} />
        <div className={`absolute -inset-4 rounded-full bg-indigo-500/20 blur-xl transition-all duration-500 ${isListening ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}`} />

        {/* Core */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)] overflow-hidden transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        >
          {/* Glass reflection */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-md" />
          <div className="absolute top-1 left-2 w-4 h-4 bg-white/40 rounded-full blur-[2px]" />
          
          {/* Inner Eye / Mic */}
          <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-overlay">
            {isListening ? (
              <Mic className="animate-pulse w-8 h-8" />
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
