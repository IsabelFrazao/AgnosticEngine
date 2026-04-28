import { ActionRegistry } from '@/src/registry/action-registry';
import { logger } from '@/src/lib/logger';

type ResolvedAction = {
  handler: (() => void) | undefined;
  forceDisabled: boolean;
};

/**
 * Resolves an actionId against the ActionRegistry.
 * Centralises the warn + disable policy so all interactive components
 * behave consistently when an actionId is missing or unregistered.
 */
export function resolveAction(actionId: string | undefined, label: string): ResolvedAction {
  if (actionId === undefined) return { handler: undefined, forceDisabled: false };
  const handler = ActionRegistry.resolve(actionId);
  if (handler) return { handler, forceDisabled: false };
  logger.warn(`"${label}": actionId "${actionId}" is not registered.`);
  return { handler: undefined, forceDisabled: true };
}
