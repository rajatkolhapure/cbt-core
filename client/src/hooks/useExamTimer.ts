import { useState, useEffect, useRef } from 'react';

interface UseExamTimerProps {
  initialRemainingSeconds: number;
  serverEndTime?: string | null;
  onTimeExpired: () => void;
  onWarning?: (secondsLeft: number) => void;
}

export function useExamTimer({
  initialRemainingSeconds,
  serverEndTime,
  onTimeExpired,
  onWarning,
}: UseExamTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialRemainingSeconds);
  const onTimeExpiredRef = useRef(onTimeExpired);
  const onWarningRef = useRef(onWarning);
  const warned5Min = useRef(false);
  const warned1Min = useRef(false);

  useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired;
    onWarningRef.current = onWarning;
  });

  useEffect(() => {
    // If serverEndTime is provided, calculate true remaining seconds against local clock
    const calculateRemaining = () => {
      if (serverEndTime) {
        const endMs = new Date(serverEndTime).getTime();
        const nowMs = Date.now();
        const diff = Math.max(0, Math.floor((endMs - nowMs) / 1000));
        return diff;
      }
      return remainingSeconds;
    };

    setRemainingSeconds(calculateRemaining());

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        let next: number;
        if (serverEndTime) {
          const endMs = new Date(serverEndTime).getTime();
          const nowMs = Date.now();
          next = Math.max(0, Math.floor((endMs - nowMs) / 1000));
        } else {
          next = Math.max(0, prev - 1);
        }

        // Warnings
        if (next <= 300 && next > 290 && !warned5Min.current) {
          warned5Min.current = true;
          onWarningRef.current?.(next);
        }
        if (next <= 60 && next > 50 && !warned1Min.current) {
          warned1Min.current = true;
          onWarningRef.current?.(next);
        }

        if (next <= 0) {
          clearInterval(interval);
          onTimeExpiredRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [serverEndTime]);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isLowTime = remainingSeconds <= 300; // <= 5 min
  const isCriticalTime = remainingSeconds <= 60; // <= 1 min

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isLowTime,
    isCriticalTime,
  };
}
