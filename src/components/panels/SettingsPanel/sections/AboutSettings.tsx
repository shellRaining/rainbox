import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

export function AboutSettings() {
  const { t } = useTranslation();
  const version = 'v0.1.0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.about.title')}</CardTitle>
        <CardDescription>{t('settings.about.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('settings.about.version')}</span>
          <span className="font-mono">{version}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('settings.about.build')}</span>
          <span className="font-mono">Tauri 2.9.1</span>
        </div>
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('settings.about.framework')}</span>
          <span className="font-mono">React 19</span>
        </div>
      </CardContent>
    </Card>
  );
}
