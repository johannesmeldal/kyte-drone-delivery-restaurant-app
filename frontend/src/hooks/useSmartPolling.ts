import { useState, useEffect, useRef, useCallback } from 'react';

export type ConnectionStatus = 'connected' | 'polling' | 'error';

interface UseSmartPollingResult<T> {
  data: T | null;
  isLoading: boolean;
  status: ConnectionStatus;
  currentInterval: number;
  refresh: () => void;
}

export function useSmartPolling<T>(
  fetchFn: () => Promise<{ notModified: boolean; data: T | null }>,
  baseInterval = 2000,
  maxInterval = 30000
): UseSmartPollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<ConnectionStatus>('polling');
  const [currentInterval, setCurrentInterval] = useState(baseInterval);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef(baseInterval);
  const noChangeCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const poll = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const result = await fetchFn();

      if (!isMountedRef.current) return;

      if (result.notModified) {
        // 304 response - no changes
        noChangeCountRef.current++;
        intervalRef.current = Math.min(
          intervalRef.current * 1.5,
          maxInterval
        );
        setStatus('polling');
        setCurrentInterval(intervalRef.current);
      } else {
        // Data changed
        noChangeCountRef.current = 0;
        intervalRef.current = baseInterval;
        setData(result.data);
        setStatus('connected');
        setCurrentInterval(intervalRef.current);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (isMountedRef.current) {
        setStatus('error');
        setIsLoading(false);
      }
    }

    // Schedule next poll
    if (isMountedRef.current) {
      timeoutRef.current = setTimeout(poll, intervalRef.current);
    }
  }, [fetchFn, baseInterval, maxInterval]);

  const refresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Reset to base interval and poll immediately
    intervalRef.current = baseInterval;
    noChangeCountRef.current = 0;
    setCurrentInterval(baseInterval);
    poll();
  }, [poll, baseInterval]);

  useEffect(() => {
    isMountedRef.current = true;
    poll();

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [poll]);

  return { 
    data, 
    isLoading, 
    status, 
    currentInterval,
    refresh 
  };
}

