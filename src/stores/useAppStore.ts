import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { toast } from 'sonner';
import type { LogEntry } from '@/types/log';
import type { PackageManager } from '@/types/package';

type ActiveView = 'manager' | 'diff' | 'settings';

interface AppState {
  managers: PackageManager[];
  selectedManager: string | null;
  activeView: ActiveView;
  loading: boolean;
  error: string | null;
  logs: LogEntry[];
  setSelectedManager: (manager: string | null) => void;
  setActiveView: (view: ActiveView) => void;
  setLogs: (logs: LogEntry[] | ((prev: LogEntry[]) => LogEntry[])) => void;
  loadManagers: () => Promise<void>;
  initializeEventListeners: () => Promise<() => void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  managers: [],
  selectedManager: null,
  activeView: 'manager',
  loading: true,
  error: null,
  logs: [],

  setSelectedManager: (manager) => set({ selectedManager: manager }),

  setActiveView: (view) => set({ activeView: view }),

  setLogs: (logs) =>
    set((state) => ({
      logs: typeof logs === 'function' ? logs(state.logs) : logs,
    })),

  loadManagers: async () => {
    try {
      set({ loading: true });
      const result = await invoke<PackageManager[]>('get_managers_status');
      set({ managers: result, error: null });

      // Auto-select first manager if none selected
      const { selectedManager } = get();
      if (result.length > 0 && !selectedManager) {
        set({ selectedManager: result[0].name });
      }
    } catch (err) {
      const errorMsg = String(err);
      set({ error: errorMsg });
      toast.error('Failed to load managers', {
        description: errorMsg,
      });
    } finally {
      set({ loading: false });
    }
  },

  initializeEventListeners: async () => {
    const unlisten = await listen('install-progress', (event) => {
      const message =
        typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload);

      set((state) => ({
        logs: [
          ...state.logs,
          {
            message,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    });

    return unlisten;
  },
}));
