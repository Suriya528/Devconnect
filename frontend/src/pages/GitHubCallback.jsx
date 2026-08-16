import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      if (!code) {
        toast.error('GitHub authorization failed');
        navigate(user ? '/profile' : '/login');
        return;
      }

      try {
        if (user) {
          // Already logged in → connect GitHub to existing account
          await axios.post('/api/github/connect', { code });
          toast.success('GitHub connected successfully! 🎉');
          navigate('/profile');
        } else {
          // Not logged in → login/register via GitHub
          const { data } = await axios.post('/api/auth/github', { code });
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
              availability: data.availability,
              githubUsername: data.githubUsername
            },
            data.token
          );
          toast.success('Welcome to DevConnect! 🚀');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'GitHub authentication failed');
        navigate(user ? '/profile' : '/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, user, login]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <h2 className="text-xl text-gray-200 font-semibold">
        {user ? 'Connecting GitHub...' : 'Signing in with GitHub...'}
      </h2>
      <p className="text-gray-500 text-sm">Please wait</p>
    </div>
  );
};

export default GitHubCallback;
