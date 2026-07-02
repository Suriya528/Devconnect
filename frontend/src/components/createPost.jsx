import { useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return toast.error('Post cannot be empty');
    if (text.length > 500) return toast.error('Max 500 characters');

    try {
      
      console.log('running')
      const { data } = await axios.post('/api/posts', { text });
      onPostCreated(data);
      setText('');
      toast.success('Post created! 🚀');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something with developers..."
            rows={3}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${text.length > 450 ? 'text-red-400' : 'text-gray-500'}`}>
              {text.length}/500
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;