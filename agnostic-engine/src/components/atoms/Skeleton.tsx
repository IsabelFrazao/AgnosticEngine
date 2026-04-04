export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-(--color-skeleton) ${className ?? ''}`} />
);
