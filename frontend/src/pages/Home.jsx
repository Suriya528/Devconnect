import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white leading-tight">
          Connect with <span className="text-blue-400">Developers</span>
        </h1>
        <p className="text-gray-400 mt-4 text-lg">
          Share your projects, find collaborators, grow your network.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border border-gray-600 hover:border-gray-400 text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;