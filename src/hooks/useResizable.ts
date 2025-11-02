import { useCallback, useEffect, useRef, useState } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onResize: (width: number) => void;
}

export function useResizable({ initialWidth, minWidth, maxWidth, onResize }: UseResizableOptions) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(initialWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 只响应左键点击
      if (e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = initialWidth;
    },
    [initialWidth]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      const delta = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + delta;
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    // 添加全局事件监听器
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 防止拖动时选中文本
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, minWidth, maxWidth, onResize]);

  return {
    isResizing,
    handleMouseDown,
  };
}
