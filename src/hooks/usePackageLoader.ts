import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import type { Package } from '@/types/package';

// 包数据缓存 - 避免重复加载
const packageCache = new Map<string, Package[]>();
const CACHE_TTL = 60000; // 60 秒缓存

export function usePackageLoader(manager: string) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPackages = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);

        // 检查缓存
        if (!forceRefresh && packageCache.has(manager)) {
          const cached = packageCache.get(manager)!;
          setPackages(cached);
          setError(null);
          setLoading(false);
          return;
        }

        const result = await invoke<Package[]>('get_packages', { manager });
        setPackages(result);
        packageCache.set(manager, result);

        // 设置缓存过期
        setTimeout(() => {
          packageCache.delete(manager);
        }, CACHE_TTL);

        setError(null);
      } catch (err) {
        const errorMsg = String(err);
        setError(errorMsg);
        toast.error('Failed to load packages', {
          description: errorMsg,
        });
      } finally {
        setLoading(false);
      }
    },
    [manager]
  );

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  return {
    packages,
    loading,
    error,
    loadPackages,
    setError,
  };
}
