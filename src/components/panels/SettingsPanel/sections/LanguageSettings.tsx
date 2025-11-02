import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function LanguageSettings() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.language.title')}</CardTitle>
        <CardDescription>{t('settings.language.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.language.label')}</Label>
            <div className="text-sm text-muted-foreground">
              {t('settings.language.label_description')}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={i18n.language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeLanguage('en')}
              className={cn('transition-all', i18n.language === 'en' && 'shadow-sm')}
            >
              <Languages className="h-4 w-4 mr-2" />
              {t('settings.language.english')}
            </Button>
            <Button
              variant={i18n.language === 'zh' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeLanguage('zh')}
              className={cn('transition-all', i18n.language === 'zh' && 'shadow-sm')}
            >
              <Languages className="h-4 w-4 mr-2" />
              {t('settings.language.chinese')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
