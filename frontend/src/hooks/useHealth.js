import { useState, useEffect, useCallback } from 'react';
import { fetchSystemHealth } from '../services/healthService';

/**
 * Custom Hook: useHealth
 * Fetches backend & MongoDB Atlas health diagnostics
 */
export const useHealth = (pollIntervalMs = null) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSystemHealth();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.message || 'Unable to connect to backend server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();

    if (pollIntervalMs) {
      const interval = setInterval(checkHealth, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [checkHealth, pollIntervalMs]);

  return { health, loading, error, lastChecked, refetch: checkHealth };
};
