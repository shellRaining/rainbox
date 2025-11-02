import { PageHeader } from '@/components/common/PageHeader';
import { useTranslation } from 'react-i18next';
import { AppearanceSettings } from './sections/AppearanceSettings';
import { LanguageSettings } from './sections/LanguageSettings';
import { KeyboardSettings } from './sections/KeyboardSettings';
import { PackageConfigSettings } from './sections/PackageConfigSettings';
import { AdvancedSettings } from './sections/AdvancedSettings';
import { AboutSettings } from './sections/AboutSettings';

export default function SettingsPanel() {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col overflow-y-auto overscroll-none">
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      <div className="flex-1 p-6 space-y-6">
        <AppearanceSettings />
        <LanguageSettings />
        <KeyboardSettings />
        <PackageConfigSettings />
        <AdvancedSettings />
        <AboutSettings />
      </div>
    </div>
  );
}
