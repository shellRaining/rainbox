import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearResetTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const copyToClipboard = async (text: string, showToast = true) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      clearResetTimer();

      if (showToast) {
        toast.success('Copied to clipboard', {
          description: text.length > 50 ? `${text.substring(0, 50)}...` : text,
        });
      }

      // 2秒后重置状态
      timeoutRef.current = window.setTimeout(() => {
        setCopiedText(null);
        timeoutRef.current = null;
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      if (showToast) {
        toast.error('Failed to copy to clipboard');
      }
      return false;
    }
  };

  const isCopied = (text: string) => copiedText === text;

  useEffect(() => () => clearResetTimer(), []);

  return { copyToClipboard, isCopied, copiedText };
}
