import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Palette, Languages, Keyboard, FolderCog, Terminal, Wrench, Info } from 'lucide-react';
import { useAppStore, type SettingsCategory } from '@/stores/useAppStore';

const settingsCategories: Array<{
  id: SettingsCategory;
  icon: typeof Palette;
  labelKey: string;
}> = [
  { id: 'appearance', icon: Palette, labelKey: 'settings.appearance.title' },
  { id: 'language', icon: Languages, labelKey: 'settings.language.title' },
  { id: 'keyboard', icon: Keyboard, labelKey: 'settings.keyboard.title' },
  { id: 'package-config', icon: FolderCog, labelKey: 'settings.package_config.title' },
  { id: 'command-path', icon: Terminal, labelKey: 'settings.command_path.title' },
  { id: 'advanced', icon: Wrench, labelKey: 'settings.advanced.title' },
  { id: 'about', icon: Info, labelKey: 'settings.about.title' },
];

export default function SettingsCategoryList() {
  const { t } = useTranslation();
  const selectedSettingsCategory = useAppStore((state) => state.selectedSettingsCategory);
  const setSelectedSettingsCategory = useAppStore((state) => state.setSelectedSettingsCategory);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('settings.title')}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-none py-2 px-2">
        <div className="space-y-1">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedSettingsCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedSettingsCategory(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isSelected && 'bg-accent text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-left">{t(category.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
