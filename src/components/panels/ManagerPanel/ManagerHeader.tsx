import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ManagerHeaderProps {
  manager: string;
  totalPackages: number;
  installedCount: number;
  notInstalledCount: number;
  installing: boolean;
  onInstallMissing: () => void;
}

export default function ManagerHeader({
  manager,
  totalPackages,
  installedCount,
  notInstalledCount,
  installing,
  onInstallMissing,
}: ManagerHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold capitalize truncate">{manager}</h2>
        <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
          <span className="font-medium">{totalPackages}</span>
          <span className="text-muted-foreground/60">{t('common.packages')}</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-500">
            {installedCount}
          </span>
          <span className="text-muted-foreground/60">{t('common.installed')}</span>
          {notInstalledCount > 0 && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="font-medium text-warning">{notInstalledCount}</span>
              <span className="text-muted-foreground/60">{t('common.missing')}</span>
            </>
          )}
        </p>
      </div>
      <div className="no-drag flex-shrink-0">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onInstallMissing}
                disabled={notInstalledCount === 0 || installing}
                aria-label={`Install ${notInstalledCount} missing packages`}
                size="sm"
                className={cn(
                  'transition-all duration-200',
                  notInstalledCount === 0 && 'opacity-50'
                )}
              >
                {installing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span aria-live="polite">{t('common.installing')}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('common.install')} {notInstalledCount > 0 && `(${notInstalledCount})`}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {notInstalledCount > 0 && !installing && (
              <TooltipContent>
                <p>
                  {t(
                    notInstalledCount > 1
                      ? 'manager.header.install_tooltip_plural'
                      : 'manager.header.install_tooltip',
                    { count: notInstalledCount }
                  )}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
