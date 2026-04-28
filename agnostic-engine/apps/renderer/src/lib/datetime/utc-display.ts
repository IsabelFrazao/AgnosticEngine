import { format, parseISO } from 'date-fns';

/** Returns a valid Date or null if the string is not a parseable ISO instant. */
export function parseUtcIso(iso: string): Date | null {
  const d = parseISO(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Long local display string for a validated UTC instant. */
export function formatUtcLongLocal(d: Date): string {
  return format(d, 'PPpp');
}
