'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * `false` during SSR and hydration-matching paint; `true` once browser-only
 * state (localStorage, locale formatting) can be read safely.
 */
export function useClientReady(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
