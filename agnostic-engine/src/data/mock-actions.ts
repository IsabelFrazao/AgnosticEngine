import { ActionRegistry } from '@/src/registry/action-registry';

[
  { id: 'demo:log',           label: 'Demo log',       handler: () => console.log('[demo:log] triggered') },
  { id: 'courses:publish',    label: 'Publish module', handler: () => console.log('[courses:publish] triggered') },
  { id: 'courses:save-draft', label: 'Save as draft',  handler: () => console.log('[courses:save-draft] triggered') },
  { id: 'courses:preview',    label: 'Preview module', handler: () => console.log('[courses:preview] triggered') },
  { id: 'courses:archive',    label: 'Archive module', handler: () => console.log('[courses:archive] triggered') },
].forEach(action => ActionRegistry.register(action));
