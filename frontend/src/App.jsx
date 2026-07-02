import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/navbar';
import ProtectedRoute from './components/protectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Feed from './pages/feed';




const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
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
        path:'feed',
        element:(
          <ProtectedRoute>
            <Feed/>
          </ProtectedRoute>
        )
      }
    ]
  }
]);

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;