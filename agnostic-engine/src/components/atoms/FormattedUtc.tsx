'use client';

import { useClientReady } from '@/src/hooks/useClientReady';
import { formatUtcLongLocal, parseUtcIso } from '@/src/lib/datetime/utc-display';

type FormattedUtcProps = {
  /** ISO 8601 UTC string from the API or CMS */
  iso: string;
};

export function FormattedUtc({ iso }: FormattedUtcProps) {
  const clientReady = useClientReady();

  const d = parseUtcIso(iso);
  if (!d) {
    return <span className="text-(--color-muted-foreground)">—</span>;
  }

  return (
    <time dateTime={iso} className="tabular-nums">
      {clientReady ? formatUtcLongLocal(d) : iso}
    </time>
  );
}
