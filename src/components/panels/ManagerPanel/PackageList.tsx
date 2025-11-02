import { EmptyState } from '@/components/common/EmptyState';
import PackageItem from './PackageItem';
import type { Package } from '@/types/package';

interface PackageListProps {
  packages: Package[];
  searchQuery: string;
  managerName: string;
  focusedIndex: number;
  onClearSearch: () => void;
}

export default function PackageList({
  packages,
  searchQuery,
  managerName,
  focusedIndex,
  onClearSearch,
}: PackageListProps) {
  if (packages.length === 0) {
    return (
      <EmptyState
        type={searchQuery ? 'no-search-results' : 'no-packages'}
        searchQuery={searchQuery}
        managerName={managerName}
        onAction={searchQuery ? onClearSearch : undefined}
      />
    );
  }

  return (
    <>
      {packages.map((pkg, index) => (
        <PackageItem
          key={pkg.name}
          pkg={pkg}
          index={index}
          searchQuery={searchQuery}
          isFocused={focusedIndex === index}
        />
      ))}
    </>
  );
}
