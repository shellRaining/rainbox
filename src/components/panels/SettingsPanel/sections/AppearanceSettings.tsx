import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Moon, Sun } from 'lucide-react';
import { useSettingsStore, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH } from '@/stores/useSettingsStore';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function AppearanceSettings() {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const sidebarWidth = useSettingsStore((state) => state.sidebarWidth);
  const setSidebarWidth = useSettingsStore((state) => state.setSidebarWidth);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.appearance.title')}</CardTitle>
        <CardDescription>{t('settings.appearance.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.appearance.theme')}</Label>
            <div className="text-sm text-muted-foreground">
              {t('settings.appearance.theme_description')}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className={cn('transition-all', theme === 'light' && 'shadow-sm')}
            >
              <Sun className="h-4 w-4 mr-2" />
              {t('settings.appearance.light')}
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className={cn('transition-all', theme === 'dark' && 'shadow-sm')}
            >
              <Moon className="h-4 w-4 mr-2" />
              {t('settings.appearance.dark')}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="sidebar-width">{t('settings.appearance.sidebar_width')}</Label>
            <span className="text-sm text-muted-foreground tabular-nums">{sidebarWidth}px</span>
          </div>
          <Slider
            id="sidebar-width"
            min={MIN_SIDEBAR_WIDTH}
            max={MAX_SIDEBAR_WIDTH}
            step={10}
            value={[sidebarWidth]}
            onValueChange={([value]) => setSidebarWidth(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{MIN_SIDEBAR_WIDTH}px</span>
            <span>{MAX_SIDEBAR_WIDTH}px</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
