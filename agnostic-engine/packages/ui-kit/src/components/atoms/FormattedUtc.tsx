'use client';

import { useClientReady } from '../../hooks/use-client-ready';
import { formatUtcLongLocal, parseUtcIso } from '../../datetime/utc-display';

type FormattedUtcProps = {
  iso: string;
  fallbackClassName?: string;
  className?: string;
};

export function FormattedUtc({ iso, fallbackClassName, className }: FormattedUtcProps) {
  const clientReady = useClientReady();
  const d = parseUtcIso(iso);
  if (!d) {
    return <span className={fallbackClassName ?? 'text-(--color-muted-foreground)'}>—</span>;
  }

  return (
    <time dateTime={iso} className={className ?? 'tabular-nums'}>
      {clientReady ? formatUtcLongLocal(d) : iso}
    </time>
  );
}
