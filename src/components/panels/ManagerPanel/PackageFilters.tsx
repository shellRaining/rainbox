import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut';

interface PackageFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: 'all' | 'installed' | 'not-installed';
  onFilterChange: (status: 'all' | 'installed' | 'not-installed') => void;
  totalCount: number;
  installedCount: number;
  notInstalledCount: number;
}

export default function PackageFilters({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  totalCount,
  installedCount,
  notInstalledCount,
}: PackageFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // Ctrl+K / Cmd+K to focus search
  useGlobalShortcut({
    key: 'k',
    ctrlKey: true,
    metaKey: true,
    onTrigger: () => {
      searchInputRef.current?.focus();
    },
  });

  return (
    <div className="flex gap-3 items-center no-drag">
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          ref={searchInputRef}
          placeholder={t('manager.filters.search_placeholder')}
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="pl-10 pr-9 h-9 bg-background"
          aria-label="Search packages"
          role="searchbox"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out p-0.5 rounded-sm hover:bg-muted"
            aria-label="Clear search"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex gap-1.5 items-center">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className="h-9 px-3"
        >
          {t('manager.filters.all')}
          <span className="ml-1.5 text-xs opacity-70">({totalCount})</span>
        </Button>
        <Button
          variant={filterStatus === 'installed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('installed')}
          className="h-9 px-3"
        >
          {t('manager.filters.installed')}
          <span className="ml-1.5 text-xs opacity-70">({installedCount})</span>
        </Button>
        <Button
          variant={filterStatus === 'not-installed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('not-installed')}
          className="h-9 px-3"
        >
          {t('manager.filters.not_installed')}
          <span className="ml-1.5 text-xs opacity-70">({notInstalledCount})</span>
        </Button>
      </div>
    </div>
  );
}
