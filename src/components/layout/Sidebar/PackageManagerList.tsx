import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import PackageManagerItem from './PackageManagerItem';
import PackageManagerHeader from './PackageManagerHeader';
import { useAppStore } from '@/stores/useAppStore';
import { useSkeletonMemory } from '@/hooks/useSkeletonMemory';

export default function PackageManagerList() {
  const managers = useAppStore((state) => state.managers);
  const selectedManager = useAppStore((state) => state.selectedManager);
  const loading = useAppStore((state) => state.loading);
  const setSelectedManager = useAppStore((state) => state.setSelectedManager);
  const { count: skeletonCount, remember } = useSkeletonMemory('managers', {
    defaultCount: 8,
    maxCount: 12,
  });

  useEffect(() => {
    if (!loading && managers.length > 0) {
      remember(managers.length);
    }
  }, [loading, managers.length, remember]);

  return (
    <div className="flex flex-col h-full">
      <PackageManagerHeader />

      <div className="flex-1 overflow-y-auto overscroll-none [&::-webkit-scrollbar]:w-0 hover:[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 [&::-webkit-scrollbar]:transition-all">
        <div className="py-2 space-y-1 px-2">
          {loading
            ? [...(Array(skeletonCount) as unknown[])].map((_, i) => (
                <div key={i} className="rounded-lg h-14 flex items-center px-3 gap-2.5">
                  <Skeleton className="h-6 w-6 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              ))
            : managers.map((manager) => (
                <PackageManagerItem
                  key={manager.name}
                  name={manager.name}
                  total={manager.total}
                  installed={manager.installed}
                  isSelected={selectedManager === manager.name}
                  onClick={() => setSelectedManager(manager.name)}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
