import PackageManagerList from './PackageManagerList';
import SettingsCategoryList from './SettingsCategoryList';
import { useAppStore } from '@/stores/useAppStore';

export default function SidebarContent() {
  const activeView = useAppStore((state) => state.activeView);

  return (
    <div className="flex-1 min-h-0">
      {activeView === 'manager' && <PackageManagerList />}
      {activeView === 'diff' && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p className="text-sm">Diff view content</p>
        </div>
      )}
      {activeView === 'settings' && <SettingsCategoryList />}
    </div>
  );
}
