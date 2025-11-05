import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Keyboard } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function KeyboardSettings() {
  const { t } = useTranslation();
  const keyboardMode = useSettingsStore((state) => state.keyboardMode);
  const setKeyboardMode = useSettingsStore((state) => state.setKeyboardMode);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.keyboard.title')}</CardTitle>
        <CardDescription>{t('settings.keyboard.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.keyboard.mode_label')}</Label>
            <div className="text-sm text-muted-foreground">
              {t('settings.keyboard.mode_description')}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={keyboardMode === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKeyboardMode('normal')}
              className={cn('transition-all', keyboardMode === 'normal' && 'shadow-sm')}
            >
              <Keyboard className="h-4 w-4 mr-2" />
              {t('settings.keyboard.normal_mode')}
            </Button>
            <Button
              variant={keyboardMode === 'vim' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKeyboardMode('vim')}
              className={cn('transition-all', keyboardMode === 'vim' && 'shadow-sm')}
            >
              <Keyboard className="h-4 w-4 mr-2" />
              {t('settings.keyboard.vim_mode')}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>{t('settings.keyboard.shortcuts_label')}</Label>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">Ctrl+K</kbd>
              <span className="text-muted-foreground/60">/</span>
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">Cmd+K</kbd>
              <span>聚焦搜索框</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">Ctrl+L</kbd>
              <span className="text-muted-foreground/60">/</span>
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">Cmd+L</kbd>
              <span>聚焦包列表</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
