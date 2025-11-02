import { PackageX, Search, FileQuestion, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  type: 'no-packages' | 'no-search-results' | 'no-manager-selected';
  searchQuery?: string;
  managerName?: string;
  onAction?: () => void;
}

export function EmptyState({ type, searchQuery, managerName, onAction }: EmptyStateProps) {
  const { t } = useTranslation();

  const states = {
    'no-packages': {
      icon: <PackageX className="h-16 w-16" />,
      title: t('empty_state.no_packages.title'),
      description: t('empty_state.no_packages.description', {
        manager: managerName || 'this manager',
      }),
      suggestion: t('empty_state.no_packages.suggestion'),
      actionLabel: t('empty_state.no_packages.action'),
      actionIcon: <ExternalLink className="h-4 w-4" />,
    },
    'no-search-results': {
      icon: <Search className="h-16 w-16" />,
      title: t('empty_state.no_search_results.title'),
      description: t('empty_state.no_search_results.description', { query: searchQuery }),
      suggestion: t('empty_state.no_search_results.suggestion'),
      actionLabel: t('empty_state.no_search_results.action'),
      actionIcon: undefined,
    },
    'no-manager-selected': {
      icon: <FileQuestion className="h-16 w-16" />,
      title: t('empty_state.no_manager_selected.title'),
      description: t('empty_state.no_manager_selected.description'),
      suggestion: t('empty_state.no_manager_selected.suggestion'),
      actionLabel: undefined,
      actionIcon: undefined,
    },
  };

  const state = states[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Icon with gradient background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-2xl" />
        <div className="relative rounded-full bg-muted/50 backdrop-blur-sm p-8 border-2 border-border/50">
          <div className="text-muted-foreground">{state.icon}</div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2 text-foreground">{state.title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-md mb-2">{state.description}</p>

      {/* Suggestion */}
      {state.suggestion && (
        <p className="text-xs text-muted-foreground/80 max-w-sm mb-6">💡 {state.suggestion}</p>
      )}

      {/* Action Button */}
      {state.actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="gap-2">
          {state.actionIcon}
          {state.actionLabel}
        </Button>
      )}
    </div>
  );
}
