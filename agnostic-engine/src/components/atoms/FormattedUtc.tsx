'use client';

import { useEffect, useState } from 'react';
import { formatUtcLongLocal, parseUtcIso } from '@/src/lib/datetime/utc-display';

type FormattedUtcProps = {
  /** ISO 8601 UTC string from the API or CMS */
  iso: string;
};

export function FormattedUtc({ iso }: FormattedUtcProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const d = parseUtcIso(iso);
  if (!d) {
    return <span className="text-[var(--color-muted-foreground)]">—</span>;
  }

  return (
    <time dateTime={iso} className="tabular-nums">
      {mounted ? formatUtcLongLocal(d) : iso}
    </time>
  );
}
