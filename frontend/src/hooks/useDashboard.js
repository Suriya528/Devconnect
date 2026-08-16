import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const useDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedDevs, setSuggestedDevs] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const [profileRes, postsRes, trendingRes, suggestedRes] = await Promise.all([
        axios.get('/api/user/profile'),
        axios.get(`/api/posts/user/${user._id}`),
        axios.get('/api/posts/trending'),
        axios.get('/api/user?limit=5')
      ]);

      setProfile(profileRes.data);
      setUserPosts(postsRes.data || []);
      setTrendingPosts(trendingRes.data || []);
      setSuggestedDevs((suggestedRes.data?.users || suggestedRes.data || []).filter(
        (dev) => dev._id !== user._id
      ));
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const totalPosts = userPosts.length;
  const totalLikes = userPosts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
  const followersCount = profile?.followers?.length || 0;
  const devScore = profile?.devScore || 0;

  return {
    profile,
    trendingPosts,
    suggestedDevs,
    loading,
    stats: {
      totalPosts,
      totalLikes,
      followersCount,
      devScore
    },
    refresh: fetchDashboard
  };
};

export default useDashboard;
