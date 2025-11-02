import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/types/log';

interface ActivityLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function ActivityLog({ logs, onClear }: ActivityLogProps) {
  if (logs.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div>
          <CardTitle className="text-base">Activity Log</CardTitle>
          <CardDescription>Installation progress</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-muted rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto overscroll-none space-y-1">
          {logs.map((log, i) => {
            const isError =
              log.message.toLowerCase().includes('error') ||
              log.message.toLowerCase().includes('failed');
            const isSuccess =
              log.message.toLowerCase().includes('success') ||
              log.message.toLowerCase().includes('installed');
            const timestamp = new Date(log.timestamp).toLocaleTimeString('en-US', {
              hour12: false,
            });

            return (
              <div
                key={i}
                className={cn(
                  'flex gap-2',
                  isError && 'text-destructive',
                  isSuccess && 'text-emerald-600 dark:text-emerald-500',
                  !isError && !isSuccess && 'text-muted-foreground'
                )}
              >
                <span className="text-xs opacity-50">[{timestamp}]</span>
                <span>{log.message}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
