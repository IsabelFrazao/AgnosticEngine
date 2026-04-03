/**
 * Single source of truth for site-level metadata.
 * Changing this file is sufficient to white-label the CMS for a new brand.
 * Consumed by app/layout.tsx (Next.js Metadata API) and any component that
 * needs the site name or description.
 */
export const SITE_CONFIG = {
  name: 'Agnostic Metadata CMS',
  description: 'Metadata-driven Next.js architecture',
} as const;
