import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Compass, Menu, X, PlusCircle, User } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add shadow/background if scrolled past 20px
      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm ${
        isActive(to)
          ? 'bg-white/10 text-white shadow-inner'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={16} className={isActive(to) ? 'text-indigo-400' : ''} />
      <span>{label}</span>
    </Link>
  );

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center p-4 transition-transform duration-500 ${
        hidden ? '-translate-y-[150%]' : 'translate-y-0'
      }`}
    >
      <nav 
        aria-label="Main navigation" 
        className={`w-full max-w-5xl transition-all duration-500 rounded-full border border-white/10 flex items-center justify-between px-6 py-3 ${
          scrolled 
            ? 'bg-[#0b1120]/80 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]' 
            : 'bg-[#06090F]/50 backdrop-blur-md'
        }`}
      >
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group mr-4"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-indigo-500/50 transition-all">
            <span className="text-white font-black text-sm">&lt;/&gt;</span>
          </div>
          <span className="text-white font-black tracking-tight text-lg hidden sm:block">
            DevConnect
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {user && (
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavLink to="/feed" icon={Compass} label="Feed" />
            <NavLink to="/search" icon={Menu} label="Discover" />
            <NavLink to="/profile" icon={User} label="Profile" />
          </div>
        )}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/feed"
                className="flex items-center gap-2 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-200 px-4 py-2 rounded-full font-bold text-sm transition-all border border-indigo-500/20 hover:border-indigo-500/40"
              >
                <PlusCircle size={16} />
                <span>Post</span>
              </Link>
              <div className="h-6 w-px bg-white/10 mx-1"></div>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-full font-bold text-sm transition-all"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-5 py-2 rounded-full font-bold text-sm transition-all hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu (Dropdown Pill) */}
      {isMobileMenuOpen && (
        <div className="absolute top-[80px] w-[calc(100%-2rem)] max-w-sm md:hidden bg-[#0b1120]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col gap-2 animate-fade-in-up">
          {user ? (
            <>
              <div className="flex items-center justify-between p-2 mb-2">
                <NotificationBell />
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`p-3 rounded-xl font-bold flex items-center gap-3 ${isActive('/dashboard') ? 'bg-white/10 text-white' : 'text-gray-300'}`}><LayoutDashboard size={18} className="text-indigo-400"/> Dashboard</Link>
              <Link to="/feed" onClick={() => setIsMobileMenuOpen(false)} className={`p-3 rounded-xl font-bold flex items-center gap-3 ${isActive('/feed') ? 'bg-white/10 text-white' : 'text-gray-300'}`}><Compass size={18} className="text-purple-400"/> Feed</Link>
              <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className={`p-3 rounded-xl font-bold flex items-center gap-3 ${isActive('/search') ? 'bg-white/10 text-white' : 'text-gray-300'}`}><Menu size={18} className="text-pink-400"/> Discover</Link>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={`p-3 rounded-xl font-bold flex items-center gap-3 ${isActive('/profile') ? 'bg-white/10 text-white' : 'text-gray-300'}`}><User size={18} className="text-blue-400"/> Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-4 text-center font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="p-4 text-center font-bold text-white bg-indigo-600 rounded-xl">Get Started</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
