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

        :{
        [
  { label: 'Posts Feed', path: '/feed' },
  { label: 'Search Developers', path: '/search' },
  { label: 'My Profile', path: '/profile' }
].map((item) => (
  <button
    key={item.label}
    onClick={() => navigate(item.path)}
    className="bg-gray-900 hover:bg-gray-800 rounded-xl p-6 text-center text-gray-300 border border-gray-800 transition-colors"
  >
    <p className="font-medium">{item.label}</p>
  </button>
))}

      </div>
    </div>
  );
};

export default Dashboard;