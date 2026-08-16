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

const Layout = () => {
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
    </>
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