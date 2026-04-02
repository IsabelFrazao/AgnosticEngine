export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-[var(--color-skeleton)] ${className ?? ''}`} />
);
