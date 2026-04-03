import { z } from 'zod';
import { buttonAtomNodeBaseSchema } from './button.schema';
import { tableAtomNodeBaseSchema } from './table.schema';
import { themeSwitcherAtomNodeBaseSchema } from './theme-switcher.schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AtomNodeBaseSchema = z.ZodObject<any>;

/**
 * Single Source of Truth for all atom node schemas.
 *
 * Law of Discovery: every new Atom MUST be registered here.
 * Both root.schema.ts (Zod validation) and component-registry.ts (React render)
 * derive from this map — no other file needs to change when adding an atom.
 *
 * Steps to add a new atom:
 *   1. Create src/schemas/atoms/{type}.schema.ts
 *   2. Add an entry to ATOM_SCHEMAS below
 *   3. Add the React component to src/registry/component-registry.ts
 */
export const ATOM_SCHEMAS = {
  button:           buttonAtomNodeBaseSchema,
  table:            tableAtomNodeBaseSchema,
  'theme-switcher': themeSwitcherAtomNodeBaseSchema,
} satisfies Record<string, AtomNodeBaseSchema>;

/** All valid component type strings — derived from the registry, never hardcoded. */
export type ComponentType = keyof typeof ATOM_SCHEMAS;

/** Union of all atom node base types (without `children`). */
export type AtomNodeBase = z.infer<(typeof ATOM_SCHEMAS)[keyof typeof ATOM_SCHEMAS]>;
