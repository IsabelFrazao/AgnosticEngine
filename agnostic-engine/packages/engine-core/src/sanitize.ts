/**
 * Allowed HTML tags in metadata string fields.
 * Only inline formatting that carries no semantic risk.
 */
const ALLOWED_TAGS = new Set(['b', 'i', 'strong']);

/**
 * Strips all HTML tags except those in ALLOWED_TAGS.
 * Attributes are removed even on allowed tags to prevent onclick=, href=, etc.
 * SSR-safe - no DOM dependency.
 */
function sanitizeString(value: string): string {
  return value.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return '';
    return match.startsWith('</') ? `</${lower}>` : `<${lower}>`;
  });
}

/**
 * Recursively walks a metadata value (object, array, or primitive)
 * and sanitizes all string leaves.
 */
export function sanitizeMetadata(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeMetadata);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeMetadata(v)]),
    );
  }
  return value;
}
