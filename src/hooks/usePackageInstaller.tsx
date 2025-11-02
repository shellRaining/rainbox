import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { ProgressToast } from '@/components/feedback/ProgressToast';
import { ErrorToast } from '@/components/feedback/ErrorToast';
import { parseError } from '@/lib/error-handler';

interface InstallOptions {
  managerName?: string;
  packages?: string[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePackageInstaller() {
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPackage, setCurrentPackage] = useState<string | null>(null);

  const installPackages = async ({ managerName, packages, onSuccess, onError }: InstallOptions) => {
    if (!managerName) {
      toast.error('Package manager not specified');
      return false;
    }

    setInstalling(true);
    setProgress(0);
    setCurrentPackage(null);

    const packageList = packages || [];
    const packageCount = packageList.length;
    const toastId = `install-${managerName}-${Date.now()}`;

    try {
      // 显示初始进度 Toast（静态，等待后端事件推进）
      toast.custom(
        () => (
          <div className="bg-background border rounded-lg shadow-lg p-4">
            <ProgressToast current={0} total={packageCount} managerName={managerName} />
          </div>
        ),
        {
          id: toastId,
          duration: Infinity,
        }
      );

      await invoke('install_packages', { manager: managerName });

      setProgress(100);

      toast.success('Installation completed', {
        id: toastId,
        description: packages
          ? `Successfully installed ${packageCount} package${packageCount > 1 ? 's' : ''}`
          : 'All packages installed successfully',
      });

      onSuccess?.();
      return true;
    } catch (error) {
      const errorInfo = parseError(error);
      console.error('Failed to install packages:', error);

      // 显示友好的错误消息
      toast.custom(
        () => (
          <div className="bg-background border rounded-lg shadow-lg p-4">
            <ErrorToast
              title={errorInfo.title}
              message={errorInfo.message}
              suggestion={errorInfo.suggestion}
              canRetry={errorInfo.canRetry}
              onRetry={
                errorInfo.canRetry
                  ? () => {
                      toast.dismiss(toastId);
                      void installPackages({ managerName, packages, onSuccess, onError });
                    }
                  : undefined
              }
            />
          </div>
        ),
        {
          id: toastId,
          duration: 10000,
        }
      );

      onError?.(errorInfo.message);
      return false;
    } finally {
      setInstalling(false);
      setProgress(0);
      setCurrentPackage(null);
    }
  };

  return {
    installing,
    progress,
    currentPackage,
    installPackages,
  };
}
