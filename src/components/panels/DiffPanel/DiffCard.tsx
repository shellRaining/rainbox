import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import { getPackageManagerIcon, getPackageManagerColor } from '@/lib/package-icons';
import PackageList from './PackageList';
import { useTranslation } from 'react-i18next';

interface DiffCardProps {
  name: string;
  displayName: string;
  toInstall: string[];
  toRemove: string[];
  isExpanded: boolean;
  loading: boolean;
  installing: boolean;
  onToggle: () => void;
  onInstall: () => void;
  onCopy: (pkg: string) => void;
  isCopied: (pkg: string) => boolean;
}

export default function DiffCard({
  name,
  displayName,
  toInstall,
  toRemove,
  isExpanded,
  loading,
  installing,
  onToggle,
  onInstall,
  onCopy,
  isCopied,
}: DiffCardProps) {
  const { t } = useTranslation();
  const hasChanges = toInstall.length > 0 || toRemove.length > 0;
  const iconColor = getPackageManagerColor(name);

  return (
    <Card
      className={`transition-all duration-200 ${hasChanges ? 'border-l-4 border-l-warning' : 'border-l-4 border-l-success'}`}
    >
      <div className="p-4">
        {/* Header */}
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => hasChanges && onToggle()}
        >
          <div className="flex items-center gap-3">
            <div className={iconColor}>{getPackageManagerIcon(name)}</div>
            <h3 className="font-semibold text-lg">{displayName}</h3>
            {!hasChanges ? (
              <Badge variant="secondary" className="gap-1">
                {t('diff.card.synchronized')}
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                {toInstall.length > 0 && (
                  <Badge
                    variant="default"
                    className="bg-warning text-warning-foreground hover:bg-warning/80"
                  >
                    {t('diff.card.to_install_badge', { count: toInstall.length })}
                  </Badge>
                )}
                {toRemove.length > 0 && (
                  <Badge variant="outline" className="bg-info-light text-info-foreground">
                    {t('diff.card.extra_badge', { count: toRemove.length })}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {toInstall.length > 0 && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onInstall();
                }}
                disabled={loading || installing}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('diff.card.install_missing')}
              </Button>
            )}

            {hasChanges &&
              (isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ))}
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && hasChanges && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 animate-in">
            <PackageList packages={toInstall} type="install" onCopy={onCopy} isCopied={isCopied} />
            <PackageList packages={toRemove} type="remove" onCopy={onCopy} isCopied={isCopied} />
          </div>
        )}
      </div>
    </Card>
  );
}
