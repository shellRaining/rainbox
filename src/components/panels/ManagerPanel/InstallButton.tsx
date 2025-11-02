import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface InstallButtonProps {
  notInstalledCount: number;
  installing: boolean;
  onInstall: () => void;
}

export default function InstallButton({
  notInstalledCount,
  installing,
  onInstall,
}: InstallButtonProps) {
  const { t } = useTranslation();

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onInstall}
            disabled={notInstalledCount === 0 || installing}
            size="sm"
            className={cn('transition-all duration-200', notInstalledCount === 0 && 'opacity-50')}
          >
            {installing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>{t('common.installing')}</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
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
  );
}
