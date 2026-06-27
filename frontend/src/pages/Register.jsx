import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName:'',
    middleName:'',
    lastName:'',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName,middleName,lastName, email, password, role } = formData;

    // Client side validation
    if (!firstName ||!middleName||!lastName || !email || !password || !role) {
      return toast.error('All fields are required fields');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/register', formData);
      login(
  {
    _id: data._id,
    firstName: data.name.firstName,
    middleName: data.name.middleName,
    lastName: data.name.lastName,
    email: data.email,
    role: data.role
  },
  data.token
);
      toast.success('Account created successfully! 🚀');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Join DevConnect</h1>
          <p className="text-gray-400 mt-2">Build your developer profile</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
  <label className="text-sm text-gray-400 mb-1 block">First Name</label>
  <input
    type="text"
    name="firstName"
    value={formData.firstName}
    onChange={handleChange}
    placeholder="Suriya"
    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
  />
</div>

<div>
  <label className="text-sm text-gray-400 mb-1 block">
    Middle Name <span className="text-gray-600">(optional)</span>
  </label>
  <input
    type="text"
    name="middleName"
    value={formData.middleName}
    onChange={handleChange}
    placeholder="Optional"
    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
  />
</div>

<div>
  <label className="text-sm text-gray-400 mb-1 block">Last Name</label>
  <input
    type="text"
    name="lastName"
    value={formData.lastName}
    onChange={handleChange}
    placeholder="E"
    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
  />
</div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="suriya@devconnect.com"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Full Stack Developer"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;