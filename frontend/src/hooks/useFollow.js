import { useState, useCallback } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const useFollow = (developerId) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFollowing = useCallback((currentUserId, followers = []) => {
    if (!currentUserId) return;
    setFollowing(followers.some((id) => id.toString() === currentUserId.toString()));
  }, []);

  const toggleFollow = useCallback(
    async (onSuccess) => {
      if (!developerId) return;

      const previousFollowing = following;
      setFollowing((prev) => !prev);
      setLoading(true);

      try {
        const { data } = await axios.post(`/api/user/${developerId}/follow`);
        setFollowing(data.following);
        toast.success(data.following ? 'Followed successfully' : 'Unfollowed successfully');
        if (onSuccess) onSuccess(data.following);
      } catch (err) {
        setFollowing(previousFollowing);
        toast.error(err.response?.data?.message || 'Failed to update follow status');
      } finally {
        setLoading(false);
      }
    },
    [developerId, following]
  );

  return { following, loading, toggleFollow, checkFollowing };
};

export default useFollow;
