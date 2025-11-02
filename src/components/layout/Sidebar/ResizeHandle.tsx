import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ResizeHandle({ isResizing, onMouseDown }: ResizeHandleProps) {
  return (
    <div
      className={cn(
        'absolute top-0 right-0 w-1 h-full cursor-col-resize group no-drag',
        'hover:bg-primary/20 transition-colors',
        isResizing && 'bg-primary/30'
      )}
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
    >
      {/* 可视化拖拽指示器 */}
      <div
        className={cn(
          'absolute top-0 right-0 w-1 h-full bg-primary/0 group-hover:bg-primary/50 transition-all',
          isResizing && 'bg-primary'
        )}
      />

      {/* 扩大鼠标交互区域 */}
      <div className="absolute top-0 right-[-4px] w-2 h-full" />
    </div>
  );
}
