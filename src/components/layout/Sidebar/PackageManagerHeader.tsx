import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/useAppStore';

export default function PackageManagerHeader() {
  const loading = useAppStore((state) => state.loading);
  const loadManagers = useAppStore((state) => state.loadManagers);

  return (
    <div className="border-b flex items-center justify-between bg-muted/20 h-[42px] px-3 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Package Managers
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void loadManagers()}
        disabled={loading}
        className="h-7 w-7 p-0"
        aria-label="Refresh package managers"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
      </Button>
    </div>
  );
}
