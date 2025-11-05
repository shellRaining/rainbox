import { PageHeader } from '@/components/common/PageHeader';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { AppearanceSettings } from './sections/AppearanceSettings';
import { LanguageSettings } from './sections/LanguageSettings';
import { KeyboardSettings } from './sections/KeyboardSettings';
import { PackageConfigSettings } from './sections/PackageConfigSettings';
import { CommandPathSettings } from './sections/CommandPathSettings';
import { AdvancedSettings } from './sections/AdvancedSettings';
import { AboutSettings } from './sections/AboutSettings';

export default function SettingsPanel() {
  const { t } = useTranslation();
  const selectedSettingsCategory = useAppStore((state) => state.selectedSettingsCategory);

  return (
    <div className="h-full flex flex-col">
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      <div className="flex-1 overflow-y-auto overscroll-none p-6">
        {selectedSettingsCategory === 'appearance' && <AppearanceSettings />}
        {selectedSettingsCategory === 'language' && <LanguageSettings />}
        {selectedSettingsCategory === 'keyboard' && <KeyboardSettings />}
        {selectedSettingsCategory === 'package-config' && <PackageConfigSettings />}
        {selectedSettingsCategory === 'command-path' && <CommandPathSettings />}
        {selectedSettingsCategory === 'advanced' && <AdvancedSettings />}
        {selectedSettingsCategory === 'about' && <AboutSettings />}
      </div>
    </div>
  );
}
