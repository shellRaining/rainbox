import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PackageConfigSettings() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.package_config.title')}</CardTitle>
        <CardDescription>{t('settings.package_config.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="config-path">{t('settings.package_config.config_dir')}</Label>
          <div className="flex gap-2">
            <Input
              id="config-path"
              placeholder="/path/to/dotfiles/packages"
              disabled
              className="flex-1"
            />
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Folder className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('settings.package_config.browse')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">{t('settings.package_config.help_text')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
