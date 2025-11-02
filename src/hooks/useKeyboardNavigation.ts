import { useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';

export type KeyboardMode = 'normal' | 'vim';

export const NavigationAction = {
  Up: 'UP',
  Down: 'DOWN',
  First: 'FIRST',
  Last: 'LAST',
  Select: 'SELECT',
  Cancel: 'CANCEL',
} as const;

export type NavigationAction = (typeof NavigationAction)[keyof typeof NavigationAction];

interface KeymapConfig {
  [key: string]: {
    action: NavigationAction;
    requiresDoublePress?: boolean;
  };
}

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  itemCount: number;
  onSelect?: (index: number) => void;
  containerRef?: RefObject<HTMLElement | null>;
}

// Keymap configurations for different modes
const KEYMAPS: Record<KeyboardMode, KeymapConfig> = {
  normal: {
    ArrowDown: { action: NavigationAction.Down },
    ArrowUp: { action: NavigationAction.Up },
    Home: { action: NavigationAction.First },
    End: { action: NavigationAction.Last },
    Enter: { action: NavigationAction.Select },
    ' ': { action: NavigationAction.Select },
    Escape: { action: NavigationAction.Cancel },
  },
  vim: {
    j: { action: NavigationAction.Down },
    k: { action: NavigationAction.Up },
    g: { action: NavigationAction.First, requiresDoublePress: true },
    G: { action: NavigationAction.Last },
    Enter: { action: NavigationAction.Select },
    ' ': { action: NavigationAction.Select },
    Escape: { action: NavigationAction.Cancel },
  },
};

/**
 * Hook for keyboard navigation in lists
 * Supports multiple keyboard modes with configurable keymaps
 */
export function useKeyboardNavigation({
  enabled = true,
  itemCount,
  onSelect,
  containerRef,
}: UseKeyboardNavigationOptions) {
  const keyboardMode = useSettingsStore((state) => state.keyboardMode);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);
  const [lastKey, setLastKey] = useState<string>('');

  const moveFocus = useCallback(
    (
      direction:
        | typeof NavigationAction.Up
        | typeof NavigationAction.Down
        | typeof NavigationAction.First
        | typeof NavigationAction.Last
    ) => {
      if (itemCount === 0) return;

      setFocusedIndex((prev) => {
        switch (direction) {
          case NavigationAction.Up:
            return prev > 0 ? prev - 1 : 0;
          case NavigationAction.Down:
            return prev < itemCount - 1 ? prev + 1 : itemCount - 1;
          case NavigationAction.First:
            return 0;
          case NavigationAction.Last:
            return itemCount - 1;
          default:
            return prev;
        }
      });
    },
    [itemCount]
  );

  const executeAction = useCallback(
    (action: NavigationAction) => {
      switch (action) {
        case NavigationAction.Up:
        case NavigationAction.Down:
        case NavigationAction.First:
        case NavigationAction.Last:
          moveFocus(action);
          break;
        case NavigationAction.Select:
          if (focusedIndex >= 0 && onSelect) {
            onSelect(focusedIndex);
          }
          break;
        case NavigationAction.Cancel:
          setFocusedIndex(-1);
          break;
      }
    },
    [focusedIndex, moveFocus, onSelect]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || itemCount === 0) return;

      const keymap = KEYMAPS[keyboardMode];
      const keyConfig = keymap[event.key];

      if (!keyConfig) {
        // Reset double-press state if key not in keymap
        const now = Date.now();
        if (now - lastKeyTime > 500) {
          setLastKey('');
        }
        return;
      }

      event.preventDefault();

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTime;

      // Handle double-press requirement (e.g., 'gg' in vim mode)
      if (keyConfig.requiresDoublePress) {
        if (lastKey === event.key && timeSinceLastKey < 500) {
          // Double press detected
          executeAction(keyConfig.action);
          setLastKey('');
        } else {
          // First press, wait for second
          setLastKey(event.key);
          setLastKeyTime(now);
        }
      } else {
        // Single press action
        executeAction(keyConfig.action);
        setLastKey('');
        setLastKeyTime(now);
      }
    },
    [enabled, itemCount, keyboardMode, lastKey, lastKeyTime, executeAction]
  );

  useEffect(() => {
    const container = containerRef?.current || document;

    if (enabled) {
      container.addEventListener('keydown', handleKeyDown as EventListener);
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [enabled, handleKeyDown, containerRef]);

  // Reset focus when item count changes
  useEffect(() => {
    if (focusedIndex >= itemCount) {
      setFocusedIndex(-1);
    }
  }, [itemCount, focusedIndex]);

  // Auto-scroll focused item into view
  useEffect(() => {
    if (focusedIndex < 0 || !containerRef?.current) return;

    const container = containerRef.current;
    const focusedElement = container.querySelector(`[data-index="${focusedIndex}"]`);

    if (focusedElement) {
      focusedElement.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [focusedIndex, containerRef]);

  return {
    focusedIndex,
    setFocusedIndex,
  };
}
