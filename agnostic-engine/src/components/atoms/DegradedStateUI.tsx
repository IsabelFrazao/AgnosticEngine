type Props = {
  itemId:   string;
  itemType: string;
  reason:   'invalid-schema' | 'unknown-type';
};

export function DegradedStateUI({ itemId, itemType, reason }: Props) {
  return (
    <div
      role="alert"
      aria-label={`Component ${itemId} failed to render`}
      className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-muted-foreground)]"
    >
      <span className="font-medium">Component unavailable</span>
      {process.env.NODE_ENV !== 'production' && (
        <span className="ml-2 font-mono text-xs">
          [{itemType} / {itemId} — {reason}]
        </span>
      )}
    </div>
  );
}
