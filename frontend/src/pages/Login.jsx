import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, Code2 } from 'lucide-react';

const GithubSVG = () => (
  <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      return toast.error('All fields are required');
    }

    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/login', formData);
      const fullName = [data.name?.firstName, data.name?.middleName, data.name?.lastName]
        .filter(Boolean)
        .join(' ');
      login(
        {
          _id: data._id,
          firstName: data.name?.firstName,
          middleName: data.name?.middleName,
          lastName: data.name?.lastName,
          email: data.email,
          role: data.role,
          bio: data.bio,
          skills: data.skills,
          location: data.location,
          github: data.github,
          linkedin: data.linkedin,
          availability: data.availability
        },
        data.token
      );
      toast.success(`Welcome back, ${fullName || 'Developer'}! 👋`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06090F] relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white mb-2 tracking-tight hover:scale-105 transition-transform">
            <Code2 className="w-8 h-8 text-indigo-400" />
            DevConnect
          </Link>
          <p className="text-gray-400">Sign in to continue your journey</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="bg-white/5 rounded-3xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-300 mb-1.5 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-black/20 text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-300 block">Password</label>
                <Link to="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/20 text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-gray-600" />
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-600 to-gray-600" />
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={() => {
              const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
              if (!clientId) return;
              const redirectUri = `${window.location.origin}/github/callback`;
              window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email,repo`;
            }}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-semibold py-3.5 rounded-xl transition-all border border-white/10"
          >
            <GithubSVG />
            Continue with GitHub
          </button>

          {/* Footer */}
          <p className="text-gray-400 text-center mt-8 text-sm">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;