import { logger } from '@/src/lib/logger';
import { ActionRegistry, type RegisteredAction } from '@/src/registry/action-registry';

const logDemoAction = (actionId: string) => () => {
  logger.info('Mock action triggered', { actionId });
};

const DEMO_ACTIONS: readonly RegisteredAction[] = [
  { id: 'demo:log', label: 'Demo log', handler: logDemoAction('demo:log') },
  { id: 'courses:publish', label: 'Publish module', handler: logDemoAction('courses:publish') },
  { id: 'courses:save-draft', label: 'Save as draft', handler: logDemoAction('courses:save-draft') },
  { id: 'courses:preview', label: 'Preview module', handler: logDemoAction('courses:preview') },
  { id: 'courses:archive', label: 'Archive module', handler: logDemoAction('courses:archive') },
];

export function registerApplicationActions(): void {
  for (const action of DEMO_ACTIONS) {
    if (!ActionRegistry.has(action.id)) {
      ActionRegistry.register(action);
    }
  }
}

registerApplicationActions();
