import ManagerPanel from '@/components/panels/ManagerPanel';
import DiffPanel from '@/components/panels/DiffPanel';
import SettingsPanel from '@/components/panels/SettingsPanel';
import { useAppStore } from '@/stores/useAppStore';

export default function MainContent() {
  const activeView = useAppStore((state) => state.activeView);
  const selectedManager = useAppStore((state) => state.selectedManager);
  const error = useAppStore((state) => state.error);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 m-4 rounded-lg">
          Error: {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {activeView === 'manager' && selectedManager && <ManagerPanel />}

        {activeView === 'diff' && <DiffPanel />}

        {activeView === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}
