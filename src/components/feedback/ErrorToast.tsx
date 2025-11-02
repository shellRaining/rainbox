import { AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorToastProps {
  title: string;
  message: string;
  suggestion?: string;
  canRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorToast({ title, message, suggestion, canRetry, onRetry }: ErrorToastProps) {
  return (
    <div className="space-y-3 min-w-[320px]">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-destructive/10 p-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-sm text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
      </div>

      {suggestion && (
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 border border-border/50">
          <Lightbulb className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground leading-relaxed">{suggestion}</p>
        </div>
      )}

      {canRetry && onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="w-full">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}
