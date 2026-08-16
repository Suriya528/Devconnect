import { useState, useCallback } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const useGitHub = () => {
  const [repos, setRepos] = useState([]);
  const [contributions, setContributions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const fetchRepos = useCallback(async (username) => {
    try {
      setLoading(true);
      const url = username
        ? `/api/github/repos/${username}`
        : '/api/github/repos';
      const { data } = await axios.get(url);
      setRepos(data);
    } catch (err) {
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContributions = useCallback(async (username) => {
    try {
      setLoading(true);
      const url = username
        ? `/api/github/contributions/${username}`
        : '/api/github/contributions';
      const { data } = await axios.get(url);
      setContributions(data);
    } catch (err) {
      setContributions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const importRepos = useCallback(async () => {
    try {
      setImportLoading(true);
      const { data } = await axios.post('/api/github/import-repos');
      toast.success(data.message || 'Repos imported!');
      return data.posts;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import repos');
      return [];
    } finally {
      setImportLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await axios.post('/api/github/disconnect');
      toast.success('GitHub disconnected');
      setRepos([]);
      setContributions(null);
      return true;
    } catch (err) {
      toast.error('Failed to disconnect GitHub');
      return false;
    }
  }, []);

  return {
    repos,
    contributions,
    loading,
    importLoading,
    fetchRepos,
    fetchContributions,
    importRepos,
    disconnect
  };
};

export default useGitHub;
