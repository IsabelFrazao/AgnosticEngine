'use client';

import { formatUtcLongLocal, parseUtcIso } from '@/src/lib/datetime/utc-display';

type FormattedUtcProps = {
  /** ISO 8601 UTC string from the API or CMS */
  iso: string;
};

export function FormattedUtc({ iso }: FormattedUtcProps) {
  const d = parseUtcIso(iso);
  if (!d) {
    return <span className="text-zinc-500">—</span>;
  }
  return (
    <time dateTime={iso} className="tabular-nums">
      {formatUtcLongLocal(d)}
    </time>
  );
}
