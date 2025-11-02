import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DiffHeaderProps {
  loading: boolean;
  totalToInstall: number;
  onRefresh: () => void;
  onSyncAll: () => void;
}

export default function DiffHeader({
  loading,
  totalToInstall,
  onRefresh,
  onSyncAll,
}: DiffHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{t('diff.header.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('diff.header.description')}</p>
      </div>
      <div className="flex gap-2 no-drag">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('diff.header.refresh')}
        </Button>
        {totalToInstall > 0 && (
          <Button size="sm" onClick={onSyncAll} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            {t('diff.header.sync_all', { count: totalToInstall })}
          </Button>
        )}
      </div>
    </div>
  );
}
