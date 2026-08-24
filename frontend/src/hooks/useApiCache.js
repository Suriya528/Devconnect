import { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../api/axios';

// Global In-Memory TTL Cache
const cache = new Map();
const DEFAULT_TTL = 30000; // 30 seconds

export const useApiCache = (url, options = {}) => {
  const { ttl = DEFAULT_TTL, enabled = true } = options;
  const [data, setData] = useState(() => {
    if (url && cache.has(url)) {
      const cached = cache.get(url);
      if (Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (!url || !enabled) return;

    // Check cache unless forcing revalidation
    if (!force && cache.has(url)) {
      const cached = cache.get(url);
      if (Date.now() - cached.timestamp < ttl) {
        if (isMounted.current) {
          setData(cached.data);
          setLoading(false);
        }
        return;
      }
    }

    if (isMounted.current) setLoading(true);

    try {
      const response = await axios.get(url);
      cache.set(url, {
        data: response.data,
        timestamp: Date.now(),
      });

      if (isMounted.current) {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [url, enabled, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    if (url) {
      cache.delete(url);
      fetchData(true);
    }
  }, [url, fetchData]);

  return { data, loading, error, refetch: () => fetchData(true), invalidate };
};

export default useApiCache;
