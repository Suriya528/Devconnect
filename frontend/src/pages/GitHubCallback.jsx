import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../api/axios';
import { Loader2 } from 'lucide-react';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const connectGitHub = async () => {
      const code = searchParams.get('code');
      if (!code) {
        toast.error('GitHub authorization failed');
        navigate('/profile');
        return;
      }

      try {
        await axios.post('/api/github/connect', { code });
        toast.success('GitHub connected successfully! 🎉');
        navigate('/profile');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to connect GitHub');
        navigate('/profile');
      }
    };

    connectGitHub();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <h2 className="text-xl text-gray-200 font-semibold">Connecting to GitHub...</h2>
      <p className="text-gray-500 text-sm">Please wait while we link your account</p>
    </div>
  );
};

export default GitHubCallback;
