import { memo, useMemo, type ReactNode } from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

const HighlightText = memo(function HighlightText({
  text,
  query,
  className = '',
}: HighlightTextProps) {
  const parts = useMemo(() => {
    if (!query.trim()) {
      return null;
    }

    const result: ReactNode[] = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let lastIndex = 0;
    let index = lowerText.indexOf(lowerQuery);

    while (index !== -1) {
      // 添加高亮前的文本
      if (index > lastIndex) {
        result.push(<span key={`normal-${lastIndex}`}>{text.substring(lastIndex, index)}</span>);
      }

      // 添加高亮的文本
      result.push(
        <mark
          key={`highlight-${index}`}
          className="bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 text-yellow-900 rounded px-0.5"
        >
          {text.substring(index, index + query.length)}
        </mark>
      );

      lastIndex = index + query.length;
      index = lowerText.indexOf(lowerQuery, lastIndex);
    }

    // 添加剩余的文本
    if (lastIndex < text.length) {
      result.push(<span key={`normal-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return result;
  }, [text, query]);

  if (!parts) {
    return <span className={className}>{text}</span>;
  }

  return <span className={className}>{parts}</span>;
});

export default HighlightText;
