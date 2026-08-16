import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Home, Search, User, LogOut, Rss, Menu, X, Bell, LayoutDashboard } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        isActive(to)
          ? 'text-blue-400 font-semibold'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      <Icon size={15} />
      {label}
    </Link>
  );

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-400" onClick={() => setMobileOpen(false)}>
          DevConnect
        </Link>

        {/* Desktop links */}
        {user ? (
          <div className="hidden md:flex items-center gap-6">
            {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
            {navLink('/feed', 'Feed', Rss)}
            {navLink('/search', 'Search', Search)}
            <NotificationBell />
            {navLink('/profile', 'Profile', User)}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            {navLink('/', 'Home', Home)}
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Register
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-800 flex flex-col gap-3">
          {user ? (
            <>
              {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
              {navLink('/feed', 'Feed', Rss)}
              {navLink('/search', 'Search', Search)}
              {navLink('/profile', 'Profile', User)}
              <div className="py-1">
                <NotificationBell />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors text-left"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              {navLink('/', 'Home', Home)}
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-center"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
