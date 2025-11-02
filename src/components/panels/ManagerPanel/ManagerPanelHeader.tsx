import { PageHeader } from '@/components/common/PageHeader';
import { useTranslation } from 'react-i18next';
import PackageFilters from './PackageFilters';
import InstallButton from './InstallButton';

interface ManagerPanelHeaderProps {
  manager: string;
  totalCount: number;
  installedCount: number;
  notInstalledCount: number;
  installing: boolean;
  searchQuery: string;
  filterStatus: 'all' | 'installed' | 'not-installed';
  onSearchChange: (query: string) => void;
  onFilterChange: (status: 'all' | 'installed' | 'not-installed') => void;
  onInstallMissing: () => void;
}

export default function ManagerPanelHeader({
  manager,
  totalCount,
  installedCount,
  notInstalledCount,
  installing,
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onInstallMissing,
}: ManagerPanelHeaderProps) {
  const { t } = useTranslation();

  const description = [
    `${totalCount} ${t('common.packages')}`,
    `${installedCount} ${t('common.installed')}`,
    notInstalledCount > 0 ? `${notInstalledCount} ${t('common.missing')}` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <PageHeader
      title={manager.charAt(0).toUpperCase() + manager.slice(1)}
      description={description}
      actions={
        <InstallButton
          notInstalledCount={notInstalledCount}
          installing={installing}
          onInstall={onInstallMissing}
        />
      }
    >
      <PackageFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        filterStatus={filterStatus}
        onFilterChange={onFilterChange}
        totalCount={totalCount}
        installedCount={installedCount}
        notInstalledCount={notInstalledCount}
      />
    </PageHeader>
  );
}
