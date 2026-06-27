import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };
  
const fullName = [user?.firstName, user?.middleName, user?.lastName]
  .filter(Boolean)
  .join(' ');




  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Profile Card */}
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
              Welcome, {fullName}! 👋
              </h1>
              <p className="text-blue-400 mt-1">{user?.role}</p>
              <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Coming soon cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {['Posts Feed', 'Search Developers', 'My Profile'].map((item) => (
            <div
              key={item}
              className="bg-gray-900 rounded-xl p-6 text-center text-gray-400 border border-gray-800"
            >
              <p className="font-medium">{item}</p>
              <p className="text-xs mt-1">Coming Day 10+</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;