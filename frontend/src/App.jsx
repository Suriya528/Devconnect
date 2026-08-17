import React, { useState } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/navbar';
import ProtectedRoute from './components/protectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Feed from './pages/feed';
import SearchPage from './pages/SearchPage';
import DeveloperProfile from './pages/DeveloperProfile';
import ProfilePage from './pages/ProfilePage';
import GitHubCallback from './pages/GitHubCallback';
import NotFound from './pages/NotFound';
import CustomCursor from './components/CustomCursor';
import NoiseOverlay from './components/NoiseOverlay';
import CommandPalette from './components/CommandPalette';
import AIOrb from './components/AIOrb';
import MatrixRain from './components/MatrixRain';
import useKonamiCode from './hooks/useKonamiCode';
import GodTerminal from './components/GodTerminal';
import useHapticAudio from './hooks/useHapticAudio';

const Layout = () => {
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const [isAscended, setIsAscended] = useState(false);
  const [showSupernova, setShowSupernova] = useState(false);
  
  const { playBassDrop, playAscendChime, startCathedralDrone } = useHapticAudio();

  useKonamiCode(() => {
    setIsMatrixMode(true);
    playBassDrop();
  });

  const handleAscend = () => {
    setIsMatrixMode(false);
    setShowSupernova(true);
    setIsAscended(true);
    playAscendChime();
    startCathedralDrone();
    
    setTimeout(() => {
      setShowSupernova(false);
    }, 3000);
  };

  const containerClasses = [
    isMatrixMode ? 'matrix-mode' : '',
    isAscended ? 'ascended-mode' : ''
  ].join(' ');

  return (
    <div id="reality-container" className={containerClasses} style={isAscended ? { filter: 'url(#singularity)' } : {}}>
      
      {showSupernova && <div className="supernova-flash" />}
      <GodTerminal onAscend={handleAscend} />

      {/* SVG Filters */}
      <svg className="fixed pointer-events-none opacity-0 w-0 h-0 z-[-1]">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
          
          {isAscended && (
            <filter id="singularity" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          )}
        </defs>
      </svg>

      {isMatrixMode ? <MatrixRain /> : <div className="aurora-bg" />}
      <CustomCursor />
      <NoiseOverlay />
      <CommandPalette />
      
      <div className={isAscended ? "fixed inset-0 flex items-center justify-center z-[99999] pointer-events-none" : ""}>
        <AIOrb forceCenter={isAscended} />
      </div>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'feed',
        element: (
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        )
      },
      {
        path: 'search',
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'developers/:id',
        element: (
          <ProtectedRoute>
            <DeveloperProfile />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'github/callback',
        element: <GitHubCallback />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            role: 'status',
            ariaProps: { role: 'status', 'aria-live': 'polite' }
          }}
        />
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;