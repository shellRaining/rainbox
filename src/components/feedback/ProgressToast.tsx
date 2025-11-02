import { Progress } from '@/components/ui/progress';
import { Loader2, Package } from 'lucide-react';

interface ProgressToastProps {
  current: number;
  total: number;
  currentPackage?: string;
  managerName: string;
}

export function ProgressToast({ current, total, currentPackage, managerName }: ProgressToastProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-3 min-w-[300px]">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Installing packages</p>
          <p className="text-xs text-muted-foreground capitalize">{managerName}</p>
        </div>
        <span className="text-sm font-mono font-semibold text-primary">{percentage}%</span>
      </div>

      <Progress value={percentage} className="h-2" />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Package className="h-3.5 w-3.5" />
        <span>
          {current} / {total} packages
          {currentPackage && (
            <>
              {' • '}
              <span className="font-medium text-foreground">{currentPackage}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
