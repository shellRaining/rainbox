import { useTranslation } from 'react-i18next';

interface DiffSummaryProps {
  totalToInstall: number;
  totalToRemove: number;
  totalManagers: number;
}

export default function DiffSummary({
  totalToInstall,
  totalToRemove,
  totalManagers,
}: DiffSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6 border-b bg-muted/50">
      <div className="flex gap-8">
        <div>
          <div className="text-2xl font-bold text-warning">{totalToInstall}</div>
          <div className="text-sm text-muted-foreground">{t('diff.summary.need_install')}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-info">{totalToRemove}</div>
          <div className="text-sm text-muted-foreground">{t('diff.summary.extra_installed')}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-muted-foreground">{totalManagers}</div>
          <div className="text-sm text-muted-foreground">{t('diff.summary.managers')}</div>
        </div>
      </div>
    </div>
  );
}
