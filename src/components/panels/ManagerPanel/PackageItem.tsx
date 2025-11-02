import { memo, useCallback } from 'react';
import { CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HighlightText from '@/components/common/HighlightText';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface Package {
  name: string;
  manager: string;
  installed: boolean;
  version: string | null;
  is_local: boolean;
}

interface PackageItemProps {
  pkg: Package;
  index: number;
  searchQuery: string;
  isFocused: boolean;
}

const PackageItem = memo(({ pkg, index, searchQuery, isFocused }: PackageItemProps) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const handleClick = useCallback(() => {
    void copyToClipboard(pkg.name);
  }, [pkg.name, copyToClipboard]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        void copyToClipboard(pkg.name);
      }
    },
    [pkg.name, copyToClipboard]
  );

  const copied = isCopied(pkg.name);

  return (
    <div
      role="listitem"
      tabIndex={0}
      data-index={index}
      aria-label={`${pkg.name}, ${pkg.installed ? 'installed' : 'not installed'}${pkg.version ? `, version ${pkg.version}` : ''}`}
      className={cn(
        'group flex items-center justify-between px-3.5 py-3 rounded-lg cursor-pointer select-none package-item-enter',
        'border-2',
        isFocused
          ? 'border-primary bg-accent/50'
          : 'border-border hover:border-border/60 hover:bg-accent/40',
        'focus:outline-none active:scale-[0.995]'
      )}
      style={{ animationDelay: `${Math.min(index * 25, 500)}ms` }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {pkg.installed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
        ) : (
          <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate leading-tight">
            <HighlightText text={pkg.name} query={searchQuery} />
          </p>
          {pkg.version && (
            <p className="text-xs text-muted-foreground mt-0.5 transition-colors duration-200 group-hover:text-foreground/70">
              v{pkg.version}
            </p>
          )}
        </div>
        {pkg.is_local && (
          <Badge variant="outline" className="text-[9px] uppercase tracking-wide flex-shrink-0">
            Local
          </Badge>
        )}
      </div>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-shrink-0 ml-3 w-4 flex items-center justify-center">
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500 transition-all animate-in" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="end">
            <p className="text-xs">{copied ? 'Copied!' : 'Click to copy'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

PackageItem.displayName = 'PackageItem';

export default PackageItem;
