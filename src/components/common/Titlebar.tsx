import { memo, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

let cachedWindow: ReturnType<typeof getCurrentWindow> | null = null;

const resolveWindow = () => {
  if (cachedWindow) {
    return cachedWindow;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  cachedWindow = getCurrentWindow();
  return cachedWindow;
};

/**
 * Lightweight custom titlebar that marks a safe drag region for the Tauri window.
 */
function Titlebar() {
  const handleMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.defaultPrevented) {
      return;
    }

    const appWindow = resolveWindow();
    if (!appWindow) {
      return;
    }

    appWindow.startDragging().catch((error) => {
      if (import.meta.env.DEV) {
        console.warn('Failed to start window drag:', error);
      }
    });
  }, []);

  return (
    <div
      className="drag-region flex-shrink-0 flex items-center justify-center border-b border-border bg-background/80 px-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground select-none"
      style={{
        height: 'calc(env(safe-area-inset-top, 0px) + 36px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        backdropFilter: 'blur(12px)',
      }}
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
    >
      Rainbox
    </div>
  );
}

export default memo(Titlebar);
