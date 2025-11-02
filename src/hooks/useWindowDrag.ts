import { useCallback } from 'react';
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
 * Returns a mouse handler that starts dragging the current Tauri window.
 * Ensures only primary-button drags originating outside of `.no-drag` elements trigger the action.
 */
export function useWindowDrag() {
  return useCallback((event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || event.defaultPrevented) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('.no-drag')) {
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
}
