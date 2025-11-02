import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'skeleton_count_';

interface UseSkeletonMemoryOptions {
  defaultCount?: number;
  maxCount?: number;
}

export function useSkeletonMemory(
  key: string,
  { defaultCount = 8, maxCount = 20 }: UseSkeletonMemoryOptions = {}
) {
  const storageKey = STORAGE_PREFIX + key;

  const [count, setCount] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        return Math.min(parsed, maxCount);
      }
    } catch {
      // Ignore storage errors
    }
    return defaultCount;
  });

  const remember = useCallback(
    (newCount: number) => {
      if (newCount <= 0) return;

      const clamped = Math.min(newCount, maxCount);
      setCount(clamped);

      try {
        localStorage.setItem(storageKey, clamped.toString());
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey, maxCount]
  );

  return { count, remember };
}
