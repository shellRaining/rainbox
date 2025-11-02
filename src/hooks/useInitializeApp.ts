import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Initialize app state and event listeners
 * Should be called once at the app root level
 */
export function useInitializeApp() {
  useEffect(() => {
    const appStore = useAppStore.getState();

    // Load managers
    void appStore.loadManagers();

    // Initialize event listeners
    let cleanup: (() => void) | undefined;
    void appStore.initializeEventListeners().then((unlisten) => {
      cleanup = unlisten;
    });

    return () => {
      cleanup?.();
    };
  }, []);
}
