import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import type { SaveAnswerInput } from '../types';

interface UseNetworkStatusProps {
  attemptId?: string;
  onSyncComplete?: (count: number) => void;
}

export function useNetworkStatus({ attemptId, onSyncComplete }: UseNetworkStatusProps = {}) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const getQueue = useCallback((): SaveAnswerInput[] => {
    if (!attemptId) return [];
    try {
      const item = localStorage.getItem(`cbt_offline_queue_${attemptId}`);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }, [attemptId]);

  const setQueue = useCallback(
    (queue: SaveAnswerInput[]) => {
      if (!attemptId) return;
      try {
        localStorage.setItem(`cbt_offline_queue_${attemptId}`, JSON.stringify(queue));
        setPendingSyncCount(queue.length);
      } catch {
        // Storage quota exceeded or disabled
      }
    },
    [attemptId]
  );

  const queueAnswer = useCallback(
    (answer: any) => {
      const queue = getQueue();
      // Replace existing answer for the same question if already in queue
      const existingIdx = queue.findIndex((a: any) => a.questionId === answer.questionId);
      if (existingIdx > -1) {
        queue[existingIdx] = answer;
      } else {
        queue.push(answer);
      }
      setQueue(queue);
    },
    [getQueue, setQueue]
  );

  const flushQueue = useCallback(async () => {
    if (!attemptId || !navigator.onLine) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    try {
      await api.post(`/attempts/${attemptId}/bulk-save`, {
        answers: queue,
      });
      setQueue([]);
      onSyncComplete?.(queue.length);
    } catch (err) {
      console.warn('Failed to sync offline answers, will retry:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [attemptId, getQueue, setQueue, onSyncComplete]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of queue length
    const initialQueue = getQueue();
    setPendingSyncCount(initialQueue.length);
    if (navigator.onLine && initialQueue.length > 0) {
      flushQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushQueue, getQueue]);

  return {
    isOnline,
    isSyncing,
    pendingSyncCount,
    queueAnswer,
    flushQueue,
  };
}
