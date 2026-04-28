import type { MetadataNode } from '@/src/schemas/root.schema';
import type { MetadataComponentPropsContract } from '@agnostic/engine-core';

/** Alias for engine input: a single node in the recursive metadata tree. */
export type MetadataSchemaItem = MetadataNode;

export type MetadataComponentProps = MetadataComponentPropsContract;

// Re-export page/layout types so consumers import from one place.
export type {
  SchemaVersion,
  PageNavItem,
  PageNavMeta,
  NavManifest,
  PageHeader,
  PageManifestEntry,
  PagesManifest,
  SidebarExtraItem,
  SidebarConfig,
  Layout,
} from '@/src/schemas/page.schema';
