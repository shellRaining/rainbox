import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type KeyboardMode = 'normal' | 'vim';
export type Theme = 'light' | 'dark';

const DEFAULT_SIDEBAR_WIDTH = 256; // 默认宽度 (w-64 = 16rem = 256px)
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;

interface SettingsState {
  keyboardMode: KeyboardMode;
  theme: Theme;
  sidebarWidth: number;
  setKeyboardMode: (mode: KeyboardMode) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarWidth: (width: number) => void;
}

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const saved = window.localStorage.getItem('settings-storage');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.state?.theme || 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to determine preferred theme:', error);
    }
    return 'light';
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      keyboardMode: 'normal',
      theme: getPreferredTheme(),
      sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
      setKeyboardMode: (mode) => set({ keyboardMode: mode }),
      setTheme: (theme) => {
        set({ theme });
        // Update DOM
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
        }
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Update DOM
          if (typeof document !== 'undefined') {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(newTheme);
          }
          return { theme: newTheme };
        }),
      setSidebarWidth: (width) => {
        const clampedWidth = Math.min(Math.max(width, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
        set({ sidebarWidth: clampedWidth });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);

// Initialize theme on module load
if (typeof document !== 'undefined') {
  const currentTheme = useSettingsStore.getState().theme;
  document.documentElement.classList.add(currentTheme);
}

export { MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH };
