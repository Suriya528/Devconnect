import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const useDeveloper = (developerId) => {
  const [developer, setDeveloper] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch developer first - this is the critical request
        const userRes = await axios.get(`/api/user/${developerId}`);
        const userData = userRes.data;

        // Flatten the nested name object for easier frontend access
        setDeveloper({
          ...userData,
          firstName: userData.name?.firstName,
          middleName: userData.name?.middleName,
          lastName: userData.name?.lastName
        });

        // Try to fetch posts, but don't fail the whole profile if this fails
        try {
          const postsRes = await axios.get(`/api/posts/user/${developerId}`);
          setPosts(postsRes.data);
        } catch (postsErr) {
          // Posts endpoint may not exist on older backends - don't block profile
          setPosts([]);
        }
      } catch (err) {
        setError('Failed to load developer profile');
        toast.error('Failed to load developer profile');
      } finally {
        setLoading(false);
      }
    };

    if (developerId) fetchDeveloper();
  }, [developerId]);

  return { developer, posts, loading, error };
};

export default useDeveloper;