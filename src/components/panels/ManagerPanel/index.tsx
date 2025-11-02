import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { usePackageInstaller } from '@/hooks/usePackageInstaller';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut';
import { useAppStore } from '@/stores/useAppStore';
import { usePackageLoader } from '@/hooks/usePackageLoader';
import { useSkeletonMemory } from '@/hooks/useSkeletonMemory';
import { cn } from '@/lib/utils';
import LoadingSkeleton from './LoadingSkeleton';
import ActivityLog from './ActivityLog';
import ManagerPanelHeader from './ManagerPanelHeader';
import PackageList from './PackageList';

export default function ManagerPanel() {
  const selectedManager = useAppStore((state) => state.selectedManager);
  const logs = useAppStore((state) => state.logs);
  const setLogs = useAppStore((state) => state.setLogs);
  const manager = selectedManager!;
  const { packages, loading, error, loadPackages, setError } = usePackageLoader(manager);
  const { count: skeletonCount, remember } = useSkeletonMemory(`packages_${manager}`, {
    defaultCount: 12,
    maxCount: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'installed' | 'not-installed'>('all');
  const [isListFocused, setIsListFocused] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const { installing, installPackages } = usePackageInstaller();

  useEffect(() => {
    if (!loading && packages.length > 0) {
      remember(packages.length);
    }
  }, [loading, packages.length, remember]);

  // 使用 useMemo 缓存过滤结果
  const filteredPackages = useMemo(() => {
    let filtered = packages;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((pkg) => pkg.name.toLowerCase().includes(lowerQuery));
    }

    if (filterStatus === 'installed') {
      filtered = filtered.filter((pkg) => pkg.installed);
    } else if (filterStatus === 'not-installed') {
      filtered = filtered.filter((pkg) => !pkg.installed);
    }

    return filtered;
  }, [packages, searchQuery, filterStatus]);

  // 键盘导航
  const { focusedIndex, setFocusedIndex } = useKeyboardNavigation({
    enabled: !loading && filteredPackages.length > 0,
    itemCount: filteredPackages.length,
    containerRef: listContainerRef,
  });

  // 全局快捷键：Ctrl+L / Cmd+L 聚焦到列表第一项
  useGlobalShortcut({
    key: 'l',
    ctrlKey: true,
    metaKey: true,
    onTrigger: () => {
      if (!loading && filteredPackages.length > 0) {
        setFocusedIndex(0);
        setIsListFocused(true);
        listContainerRef.current?.focus();
      }
    },
    enabled: !loading && filteredPackages.length > 0,
  });

  const handleInstallMissing = useCallback(async () => {
    const missingPackages = packages.filter((p) => !p.installed).map((p) => p.name);
    if (missingPackages.length === 0) return;

    setLogs([]);

    const success = await installPackages({
      managerName: manager,
      packages: missingPackages,
      onSuccess: () => {
        void loadPackages(true); // 强制刷新
      },
      onError: (errorMsg) => {
        setError(errorMsg);
      },
    });

    if (!success) {
      console.error('Package installation failed');
    }
  }, [packages, manager, installPackages, setLogs, loadPackages, setError]);

  const installedCount = packages.filter((p) => p.installed).length;
  const notInstalledCount = packages.length - installedCount;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <ManagerPanelHeader
        manager={manager}
        totalCount={packages.length}
        installedCount={installedCount}
        notInstalledCount={notInstalledCount}
        installing={installing}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterStatus}
        onInstallMissing={() => void handleInstallMissing()}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-none px-6 py-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton count={skeletonCount} />
        ) : (
          <div
            className={cn(
              'space-y-1.5 outline-none rounded-lg transition-all duration-200 p-2 -m-2',
              isListFocused && 'shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] bg-accent/30'
            )}
            ref={listContainerRef}
            role="list"
            tabIndex={-1}
            aria-label={`${manager} packages`}
            onFocus={() => setIsListFocused(true)}
            onBlur={() => setIsListFocused(false)}
          >
            <PackageList
              packages={filteredPackages}
              searchQuery={searchQuery}
              managerName={manager}
              focusedIndex={focusedIndex}
              onClearSearch={() => setSearchQuery('')}
            />
          </div>
        )}

        {/* Activity Log */}
        <ActivityLog logs={logs} onClear={() => setLogs([])} />
      </div>
    </div>
  );
}
