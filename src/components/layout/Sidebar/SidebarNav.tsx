import { Package, GitCompare, Settings } from 'lucide-react';
import SidebarNavButton from './SidebarNavButton';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from 'react-i18next';

export default function SidebarNav() {
  const activeView = useAppStore((state) => state.activeView);
  const setActiveView = useAppStore((state) => state.setActiveView);
  const { t } = useTranslation();

  return (
    <div className="px-3 pt-8 pb-3 border-b">
      <nav role="navigation" aria-label="Main navigation" className="space-y-1">
        <SidebarNavButton
          icon={Package}
          label={t('nav.managers')}
          isActive={activeView === 'manager'}
          onClick={() => setActiveView('manager')}
        />
        <SidebarNavButton
          icon={GitCompare}
          label={t('nav.diff')}
          isActive={activeView === 'diff'}
          onClick={() => setActiveView('diff')}
        />
        <SidebarNavButton
          icon={Settings}
          label={t('nav.settings')}
          isActive={activeView === 'settings'}
          onClick={() => setActiveView('settings')}
        />
      </nav>
    </div>
  );
}
