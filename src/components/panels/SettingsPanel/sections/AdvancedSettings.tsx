import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function AdvancedSettings() {
  const { t } = useTranslation();
  const loading = useAppStore((state) => state.loading);
  const loadManagers = useAppStore((state) => state.loadManagers);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.advanced.title')}</CardTitle>
        <CardDescription>{t('settings.advanced.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.advanced.refresh_label')}</Label>
            <div className="text-sm text-muted-foreground">
              {t('settings.advanced.refresh_description')}
            </div>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadManagers()}
                  disabled={loading}
                >
                  <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                  {t('settings.advanced.refresh_button')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('settings.advanced.refresh_tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
