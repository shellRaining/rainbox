import { Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

interface PackageListProps {
  packages: string[];
  type: 'install' | 'remove';
  onCopy: (pkg: string) => void;
  isCopied: (pkg: string) => boolean;
}

export default function PackageList({ packages, type, onCopy, isCopied }: PackageListProps) {
  const { t } = useTranslation();
  const isInstall = type === 'install';
  const config = isInstall
    ? {
        title: t('diff.package_list.to_install'),
        bgClass: 'bg-warning-light text-warning-foreground hover:bg-warning-light/70',
        dotClass: 'bg-warning',
        textClass: 'text-warning',
        prefix: '+',
      }
    : {
        title: t('diff.package_list.extra_installed'),
        bgClass: 'bg-info-light text-info-foreground hover:bg-info-light/70',
        dotClass: 'bg-info',
        textClass: 'text-info',
        prefix: '⚠',
      };

  if (packages.length === 0) return null;

  return (
    <div>
      <div className={`text-sm font-medium ${config.textClass} mb-2 flex items-center gap-2`}>
        <div className={`h-1 w-1 rounded-full ${config.dotClass}`} />
        {config.title} ({packages.length})
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto overscroll-none pr-2">
        {packages.map((pkg, index) => (
          <TooltipProvider key={pkg} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`group text-sm px-3 py-1.5 rounded ${config.bgClass} transition-colors cursor-pointer select-none animate-in flex items-center justify-between`}
                  style={{ animationDelay: `${index * 15}ms` }}
                  onClick={() => onCopy(pkg)}
                >
                  <span className="flex-1">
                    {config.prefix} {pkg}
                  </span>
                  {isCopied(pkg) ? (
                    <Check className={`h-3 w-3 ${config.textClass} ml-2 flex-shrink-0`} />
                  ) : (
                    <span className="h-3 w-3 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      📋
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{isCopied(pkg) ? 'Copied!' : 'Click to copy'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
