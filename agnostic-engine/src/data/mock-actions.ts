import { ActionRegistry } from '@/src/registry/action-registry';
import { logger } from '@/src/lib/logger';

const logDemoAction = (actionId: string) => () => {
  logger.info('Mock action triggered', { actionId });
};

[
  { id: 'demo:log', label: 'Demo log', handler: logDemoAction('demo:log') },
  { id: 'courses:publish', label: 'Publish module', handler: logDemoAction('courses:publish') },
  { id: 'courses:save-draft', label: 'Save as draft', handler: logDemoAction('courses:save-draft') },
  { id: 'courses:preview', label: 'Preview module', handler: logDemoAction('courses:preview') },
  { id: 'courses:archive', label: 'Archive module', handler: logDemoAction('courses:archive') },
].forEach(action => ActionRegistry.register(action));
