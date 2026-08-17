import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, LayoutDashboard, User, LogOut, Code, Terminal, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useHapticAudio from '../hooks/useHapticAudio';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { playTick, playPop } = useHapticAudio();

  // Define commands based on auth state
  const commands = [
    { id: 'search', title: 'Search Developers', icon: Search, action: () => navigate('/search'), reqAuth: true },
    { id: 'feed', title: 'Go to Feed', icon: Compass, action: () => navigate('/feed'), reqAuth: true },
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), reqAuth: true },
    { id: 'profile', title: 'My Profile', icon: User, action: () => navigate('/profile'), reqAuth: true },
    { id: 'login', title: 'Sign In', icon: Terminal, action: () => navigate('/login'), reqAuth: false },
    { id: 'register', title: 'Get Started', icon: Zap, action: () => navigate('/register'), reqAuth: false },
    { id: 'logout', title: 'Sign Out', icon: LogOut, action: () => { logout(); navigate('/'); }, reqAuth: true },
  ];

  // Filter commands
  const filteredCommands = commands.filter(c => 
    (c.reqAuth === !!user || c.id === 'login' || c.id === 'register') &&
    (user || (!user && c.reqAuth === false)) &&
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
        playPop();
      }
      
      // Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        playPop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, playPop]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleNavigation = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        playTick();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        playTick();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          playPop();
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, filteredCommands, selectedIndex, playTick, playPop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#06090F]/60 backdrop-blur-md animate-fade-in"
        onClick={() => { setIsOpen(false); playPop(); }}
      />
      
      {/* Palette */}
      <div 
        className="relative w-full max-w-lg bg-[#0b1120]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-white/5">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-500"
          />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded text-xs font-bold border border-indigo-500/20">
              Press 'V' to speak
            </span>
            <kbd className="hidden sm:inline-block bg-white/10 text-gray-400 px-2 py-1 rounded text-xs font-mono border border-white/5">ESC</kbd>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 scrollbar-hide">
          {filteredCommands.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Suggestions
              </div>
              {filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    onMouseEnter={() => { setSelectedIndex(index); playTick(); }}
                    onClick={() => { playPop(); cmd.action(); setIsOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' 
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-white' : 'text-gray-400'} />
                    <span className="font-medium text-sm">{cmd.title}</span>
                    {isSelected && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-indigo-200">
                        <Code size={12} /> Enter
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm">No results found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
