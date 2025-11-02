import { Button } from '@/components/ui/button';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;

interface SidebarNavButtonProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export default function SidebarNavButton({
  icon: Icon,
  label,
  isActive = false,
  onClick,
}: SidebarNavButtonProps) {
  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      size="sm"
      className="w-full justify-start"
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="flex items-center justify-start w-full">
        <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="ml-2">{label}</span>
      </div>
    </Button>
  );
}
