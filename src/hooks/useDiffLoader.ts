import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import type { DiffResult } from '@/types/package';

export function useDiffLoader() {
  const [diffs, setDiffs] = useState<DiffResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const loadDiffs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<DiffResult[]>('get_diff');
      setDiffs(result);
    } catch (error) {
      const errorMsg = String(error);
      console.error('Failed to load diffs:', error);
      toast.error('Failed to load diff', {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDiffs();
  }, [loadDiffs]);

  const toggleCard = useCallback((name: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const totalToInstall = diffs.reduce((sum, diff) => sum + diff.to_install.length, 0);
  const totalToRemove = diffs.reduce((sum, diff) => sum + diff.to_remove.length, 0);

  return {
    diffs,
    loading,
    expandedCards,
    totalToInstall,
    totalToRemove,
    loadDiffs,
    toggleCard,
    setLoading,
  };
}
