import React, { useState, useEffect, useRef } from 'react';

const GodTerminal = ({ onAscend }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    "DevConnect OS [Version 10.0.0]",
    "(c) DevConnect Corporation. All rights reserved.",
    "",
    "Type 'help' for a list of commands."
  ]);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle on backtick
      if (e.key === '`') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      setInput('');
      
      const newHistory = [...history, `> ${input}`];

      if (cmd === 'ascend') {
        newHistory.push("WARNING: Ascension protocol initiated.");
        newHistory.push("Shedding mortal constraints...");
        newHistory.push("Entering The White Room.");
        onAscend();
      } else if (cmd === 'help') {
        newHistory.push("Available commands:");
        newHistory.push("  help   - Show this message");
        newHistory.push("  clear  - Clear terminal output");
        newHistory.push("  ascend - [REDACTED]");
      } else if (cmd === 'clear') {
        setHistory([]);
        return;
      } else if (cmd !== '') {
        newHistory.push(`Command not recognized: ${input}`);
      }
      
      setHistory(newHistory);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-3xl flex flex-col font-mono text-green-400 p-8 animate-fade-in-up">
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto mb-4 space-y-2 text-sm md:text-base leading-relaxed"
      >
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
      </div>
      
      <div className="flex items-center text-sm md:text-base">
        <span className="mr-2">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent outline-none border-none text-green-400"
          spellCheck="false"
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default GodTerminal;
