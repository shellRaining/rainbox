import { DraggableHeader } from '@/components/common/DraggableHeader';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, children, className }: PageHeaderProps) {
  return (
    <DraggableHeader className={cn('px-6 py-5 border-b bg-background/50', className)}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="no-drag flex-shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </DraggableHeader>
  );
}
