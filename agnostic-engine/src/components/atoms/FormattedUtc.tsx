'use client';

import { format, parseISO } from 'date-fns';

type FormattedUtcProps = {
  /** ISO 8601 UTC string from the API or CMS */
  iso: string;
};

export function FormattedUtc({ iso }: FormattedUtcProps) {
  const d = parseISO(iso);
  if (Number.isNaN(d.getTime())) {
    return <span className="text-zinc-500">—</span>;
  }
  return (
    <time dateTime={iso} className="tabular-nums">
      {format(d, 'PPpp')}
    </time>
  );
}
