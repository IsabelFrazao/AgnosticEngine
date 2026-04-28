/**
 * Public entry for the metadata pipeline: sanitize string leaves in props payloads.
 * Implementation lives in `security.ts` (SSR-safe HTML allowlist).
 */
export { sanitizeMetadata } from '@/src/utils/security';
