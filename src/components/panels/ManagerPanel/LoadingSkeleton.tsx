import { Skeleton } from '@/components/ui/skeleton';

const MAX_SKELETON_COUNT = 20;

interface LoadingSkeletonProps {
  count?: number;
}

export default function LoadingSkeleton({ count = 12 }: LoadingSkeletonProps) {
  const displayCount = Math.min(count, MAX_SKELETON_COUNT);

  return (
    <div className="space-y-2">
      {[...(Array(displayCount) as unknown[])].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3.5 py-3 rounded-lg border-2 border-border animate-in"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-3.5 w-full max-w-[200px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
          <Skeleton className="h-4 w-4 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
