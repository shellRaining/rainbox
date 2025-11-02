import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useWindowDrag } from '@/hooks/useWindowDrag';

interface DraggableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DraggableHeader({ children, className }: DraggableHeaderProps) {
  const handleWindowDrag = useWindowDrag();

  return (
    <div
      className={cn('drag-region', className)}
      data-tauri-drag-region
      onMouseDown={handleWindowDrag}
    >
      {children}
    </div>
  );
}
