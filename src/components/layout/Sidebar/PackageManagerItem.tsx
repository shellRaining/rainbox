import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getPackageManagerIcon, getPackageManagerColor } from '@/lib/package-icons';

interface PackageManagerItemProps {
  name: string;
  total: number;
  installed: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function PackageManagerItem({
  name,
  total,
  installed,
  isSelected,
  onClick,
}: PackageManagerItemProps) {
  const missingCount = total - installed;
  const progress = total > 0 ? (installed / total) * 100 : 100;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg hover:bg-accent/60 active:bg-accent/80 h-14 px-3',
        isSelected ? 'bg-accent border-2 border-primary/40' : 'border-2 border-transparent'
      )}
    >
      <div className="flex items-center h-full gap-2.5">
        {/* 图标区域 */}
        <div className="flex items-center justify-center relative flex-shrink-0">
          <div className={getPackageManagerColor(name)}>{getPackageManagerIcon(name)}</div>
          {missingCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-3 w-3 p-0 flex items-center justify-center text-[8px] font-bold rounded-full bg-warning text-warning-foreground hover:bg-warning/80"
            >
              !
            </Badge>
          )}
        </div>

        {/* 文本和进度条区域 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className={cn(
                'text-sm font-medium capitalize truncate whitespace-nowrap',
                isSelected ? 'text-foreground' : 'text-foreground/90'
              )}
            >
              {name}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={cn(
                  'text-[11px] font-mono tabular-nums whitespace-nowrap',
                  isSelected ? 'text-foreground/70' : 'text-muted-foreground'
                )}
              >
                {installed}/{total}
              </span>
              {missingCount > 0 && (
                <Badge
                  variant="default"
                  className="h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold rounded-full bg-warning text-warning-foreground hover:bg-warning/80"
                >
                  !
                </Badge>
              )}
            </div>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: missingCount > 0 ? 'hsl(38 92% 50%)' : 'hsl(142 76% 36%)',
              }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
