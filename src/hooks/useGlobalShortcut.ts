import { useEffect, useCallback } from 'react';

interface UseGlobalShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  onTrigger: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook for registering global keyboard shortcuts
 * Example: Ctrl+K or Cmd+K to focus search
 * Note: If both ctrlKey and metaKey are true, either one will trigger the shortcut
 */
export function useGlobalShortcut({
  key,
  ctrlKey = false,
  metaKey = false,
  altKey = false,
  shiftKey = false,
  onTrigger,
  enabled = true,
  preventDefault = true,
}: UseGlobalShortcutOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const matchesKey = event.key.toLowerCase() === key.toLowerCase();

      // If both ctrlKey and metaKey are specified, match either (for cross-platform Ctrl/Cmd)
      const matchesModifier =
        ctrlKey && metaKey
          ? (event.ctrlKey || event.metaKey) &&
            !event.altKey === !altKey &&
            !event.shiftKey === !shiftKey
          : event.ctrlKey === ctrlKey &&
            event.metaKey === metaKey &&
            event.altKey === altKey &&
            event.shiftKey === shiftKey;

      if (matchesKey && matchesModifier) {
        if (preventDefault) {
          event.preventDefault();
        }
        onTrigger();
      }
    },
    [key, ctrlKey, metaKey, altKey, shiftKey, onTrigger, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
