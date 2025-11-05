import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Search, FolderOpen, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { type AppConfig, type CommandPathStatus, PACKAGE_MANAGERS } from '@/types/config';
import { useTranslation } from 'react-i18next';

export function CommandPathSettings() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<AppConfig>({ command_paths: {} });
  const [detected, setDetected] = useState<Record<string, string>>({});
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await invoke<AppConfig>('get_config');
        setConfig(cfg);
      } catch (error) {
        console.error('Failed to load config:', error);
        toast.error(t('settings.command_path.toast.load_failed'));
      }
    };

    void loadConfig();
  }, [t]);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const detectedPaths = await invoke<Record<string, string>>('auto_detect_commands');
      setDetected(detectedPaths);

      const detectedCount = Object.keys(detectedPaths).length;
      toast.success(t('settings.command_path.toast.detected', { count: detectedCount }));
    } catch (error) {
      console.error('Auto-detect failed:', error);
      toast.error(t('settings.command_path.toast.detect_failed'));
    } finally {
      setIsDetecting(false);
    }
  };

  const handleApplyDetected = async () => {
    setIsSaving(true);
    try {
      const newConfig = {
        ...config,
        command_paths: {
          ...config.command_paths,
          ...detected,
        },
      };
      await invoke('save_config', { config: newConfig });
      setConfig(newConfig);
      toast.success(t('settings.command_path.toast.applied'));
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error(t('settings.command_path.toast.apply_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPath = async (command: string, path: string) => {
    try {
      await invoke('set_command_path', { command, path });
      setConfig({
        ...config,
        command_paths: {
          ...config.command_paths,
          [command]: path,
        },
      });
      toast.success(t('settings.command_path.toast.set_success', { command }));
    } catch (error) {
      console.error('Failed to set path:', error);
      toast.error(t('settings.command_path.toast.set_failed', { command }));
    }
  };

  const handleBrowse = async (command: string) => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });

      if (selected) {
        await handleSetPath(command, selected);
      }
    } catch (error) {
      console.error('Failed to browse:', error);
    }
  };

  const handleClearPath = async (command: string) => {
    try {
      const newPaths = { ...config.command_paths };
      delete newPaths[command];

      const newConfig = { ...config, command_paths: newPaths };
      await invoke('save_config', { config: newConfig });
      setConfig(newConfig);
      toast.success(t('settings.command_path.toast.cleared', { command }));
    } catch (error) {
      console.error('Failed to clear path:', error);
      toast.error(t('settings.command_path.toast.clear_failed', { command }));
    }
  };

  const getCommandStatus = (command: string): CommandPathStatus => {
    const configured = config.command_paths[command];
    const detectedPath = detected[command];

    return {
      command,
      displayName: PACKAGE_MANAGERS.find((pm) => pm.command === command)?.displayName || command,
      configured: !!configured,
      path: configured || null,
      detected: detectedPath || null,
      exists: !!configured || !!detectedPath,
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('settings.command_path.title')}</CardTitle>
            <CardDescription>{t('settings.command_path.description')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoDetect} disabled={isDetecting}>
              {isDetecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('settings.command_path.detecting')}
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  {t('settings.command_path.auto_detect')}
                </>
              )}
            </Button>
            {Object.keys(detected).length > 0 && (
              <Button size="sm" onClick={handleApplyDetected} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('settings.command_path.applying')}
                  </>
                ) : (
                  t('settings.command_path.apply_all', { count: Object.keys(detected).length })
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {PACKAGE_MANAGERS.map(({ command, displayName }) => {
            const status = getCommandStatus(command);
            const hasDetected = !!detected[command];
            const currentPath = status.path || detected[command] || '';

            return (
              <div key={command} className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`path-${command}`} className="text-base font-semibold">
                      {displayName}
                    </Label>
                    {status.configured ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('settings.command_path.status.configured')}
                      </Badge>
                    ) : hasDetected ? (
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {t('settings.command_path.status.detected')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        {t('settings.command_path.status.not_found')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      id={`path-${command}`}
                      value={currentPath}
                      onChange={(e) => {
                        // Update local state for immediate feedback
                        if (hasDetected) {
                          setDetected({ ...detected, [command]: e.target.value });
                        }
                      }}
                      placeholder={t('settings.command_path.placeholder', { command })}
                      className="font-mono text-sm select-text"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleBrowse(command)}
                      title={t('settings.command_path.browse')}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {hasDetected && !status.configured && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetPath(command, detected[command])}
                      >
                        {t('settings.command_path.use_detected')}
                      </Button>
                    )}
                    {currentPath && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetPath(command, currentPath)}
                      >
                        {t('common.save')}
                      </Button>
                    )}
                    {status.configured && (
                      <Button variant="ghost" size="sm" onClick={() => handleClearPath(command)}>
                        {t('common.clear')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">{t('settings.command_path.tip')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
