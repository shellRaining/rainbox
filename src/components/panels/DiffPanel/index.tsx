import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { usePackageInstaller } from '@/hooks/usePackageInstaller';
import { useDiffLoader } from '@/hooks/useDiffLoader';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import DiffSummary from './DiffSummary';
import DiffCard from './DiffCard';

export default function DiffPanel() {
  const {
    diffs,
    loading,
    expandedCards,
    totalToInstall,
    totalToRemove,
    loadDiffs,
    toggleCard,
    setLoading,
  } = useDiffLoader();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { installing, installPackages } = usePackageInstaller();
  const { t } = useTranslation();

  const handleSyncAll = useCallback(async () => {
    setLoading(true);

    try {
      for (const diff of diffs) {
        if (diff.to_install.length > 0) {
          await installPackages({
            managerName: diff.name,
            packages: diff.to_install,
          });
        }
      }

      await loadDiffs();
    } catch (error) {
      console.error('Failed to sync packages:', error);
    } finally {
      setLoading(false);
    }
  }, [diffs, installPackages, loadDiffs, setLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PageHeader
        title={t('diff.header.title')}
        description={t('diff.header.description')}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void loadDiffs()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t('diff.header.refresh')}
            </Button>
            {totalToInstall > 0 && (
              <Button size="sm" onClick={() => void handleSyncAll()} disabled={loading}>
                <Download className="h-4 w-4" />
                {t('diff.header.sync_all', { count: totalToInstall })}
              </Button>
            )}
          </>
        }
      />

      {/* Summary */}
      <DiffSummary
        totalToInstall={totalToInstall}
        totalToRemove={totalToRemove}
        totalManagers={diffs.length}
      />

      {/* Diff List */}
      <div className="flex-1 overflow-y-auto overscroll-none p-6">
        <div className="space-y-4">
          {diffs.map((diff) => {
            const hasChanges = diff.to_install.length > 0 || diff.to_remove.length > 0;
            const isExpanded = expandedCards.has(diff.name) || !hasChanges;

            return (
              <DiffCard
                key={diff.name}
                name={diff.name}
                displayName={diff.display_name}
                toInstall={diff.to_install}
                toRemove={diff.to_remove}
                isExpanded={isExpanded}
                loading={loading}
                installing={installing}
                onToggle={() => toggleCard(diff.name)}
                onInstall={() => {
                  void (async () => {
                    setLoading(true);

                    await installPackages({
                      managerName: diff.name,
                      packages: diff.to_install,
                      onSuccess: () => {
                        void loadDiffs();
                      },
                    });

                    setLoading(false);
                  })();
                }}
                onCopy={() => void copyToClipboard(diff.to_install.join(' '))}
                isCopied={isCopied}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
