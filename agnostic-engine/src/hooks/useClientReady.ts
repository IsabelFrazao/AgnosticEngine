import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * `false` during SSR and the hydration-matching paint; `true` once the client
 * may read browser-only state (localStorage theme, locale formatting, etc.).
 */
export function useClientReady(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
