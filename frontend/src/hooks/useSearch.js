import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import useDebounce from './useDebounce';

const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setError(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(
          `/api/user/search?search=${encodeURIComponent(debouncedQuery)}`
        );
        setResults(data);
      } catch (err) {
        setError('Search failed. Please try again.');
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  return { query, setQuery, results, loading, error };
};

export default useSearch;