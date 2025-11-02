import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, Bug, Copy, Save } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { useState } from 'react';
import { toast } from 'sonner';

export function AdvancedSettings() {
  const { t } = useTranslation();
  const loading = useAppStore((state) => state.loading);
  const loadManagers = useAppStore((state) => state.loadManagers);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const runDiagnostic = async () => {
    try {
      const info = await invoke<unknown>('get_diagnostic_info');
      setDiagnosticInfo(JSON.stringify(info, null, 2));
      setShowDiagnostic(true);
    } catch (error) {
      setDiagnosticInfo(`Error: ${error}`);
      setShowDiagnostic(true);
    }
  };

  const copyDiagnostic = async () => {
    try {
      await navigator.clipboard.writeText(diagnosticInfo);
      toast.success('Diagnostic info copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const saveDiagnostic = async () => {
    try {
      const filePath = await save({
        defaultPath: `diagnostic-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          {
            name: 'JSON',
            extensions: ['json'],
          },
          {
            name: 'Text',
            extensions: ['txt'],
          },
        ],
      });

      if (filePath) {
        await writeTextFile(filePath, diagnosticInfo);
        toast.success('Diagnostic info saved successfully');
      }
    } catch (error) {
      toast.error(`Failed to save file: ${error}`);
    }
  };

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

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Diagnostic Info</Label>
            <div className="text-sm text-muted-foreground">
              View path and configuration debug information
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void runDiagnostic()}>
            <Bug className="h-4 w-4 mr-2" />
            Run Diagnostic
          </Button>
        </div>

        {showDiagnostic && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Diagnostic Output</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => void copyDiagnostic()}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => void saveDiagnostic()}>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save to File
                </Button>
              </div>
            </div>
            <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96 font-mono select-text cursor-text">
              {diagnosticInfo}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
