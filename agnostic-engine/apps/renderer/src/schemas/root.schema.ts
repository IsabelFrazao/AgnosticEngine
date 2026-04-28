import { z } from 'zod';
import { ATOM_SCHEMAS, type AtomNodeBase, type ComponentType } from './atoms';

export type { ComponentType };

/** All registered type keys as a runtime array (useful for validation elsewhere). */
export const COMPONENT_TYPES = Object.keys(ATOM_SCHEMAS) as ComponentType[];

/**
 * Recursive node type: any registered atom base, optionally with nested children.
 * Intersection distributes over the union: (A | B) & C → (A & C) | (B & C).
 */
export type MetadataNode = AtomNodeBase & { children?: MetadataNode[] };

/**
 * Recursive discriminated union built dynamically from ATOM_SCHEMAS.
 *
 * Law of Discovery: add atoms only under src/schemas/atoms/ (see index.ts + *.schema.ts).
 * This schema self-rebuilds — no changes needed here.
 *
 * The `as unknown as ZodType<MetadataNode>` cast is intentional:
 * using ZodObject<any> for the dynamic branches loses output-type information,
 * so TypeScript can't infer the correct output through z.lazy. The explicit
 * annotation is the source of truth; runtime validation is correct.
 */
export const MetadataNodeSchema = z.lazy(() => {
  const childrenField = z.lazy(() => MetadataNodeSchema.array()).optional();

  // Extend every registered atom schema with the recursive children field.
  const branches = Object.values(ATOM_SCHEMAS).map((s) =>
    s.extend({ children: childrenField })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as unknown as [z.ZodObject<any>, z.ZodObject<any>, ...z.ZodObject<any>[]];

  return z.discriminatedUnion('type', branches);
}) as unknown as z.ZodType<MetadataNode>;
