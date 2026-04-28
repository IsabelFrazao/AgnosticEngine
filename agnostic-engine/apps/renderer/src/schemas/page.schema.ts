import { z } from 'zod';
import { MetadataNodeSchema } from '@/src/schemas/root.schema';
import { createPageSchemas, type SchemaVersion as SharedSchemaVersion } from '@agnostic/metadata-schema';

const pageSchemas = createPageSchemas(MetadataNodeSchema);

export const SchemaVersionSchema = pageSchemas.SchemaVersionSchema;
export const PageNavItemSchema = pageSchemas.PageNavItemSchema;
export const SidebarExtraItemSchema = pageSchemas.SidebarExtraItemSchema;
export const SidebarConfigSchema = pageSchemas.SidebarConfigSchema;
export const PageHeaderSchema = pageSchemas.PageHeaderSchema;
export const PageManifestEntrySchema = pageSchemas.PageManifestEntrySchema;
export const PagesManifestSchema = pageSchemas.PagesManifestSchema;
export const LayoutSchema = pageSchemas.LayoutSchema;

export type SchemaVersion = SharedSchemaVersion;
export type PageNavItem = z.infer<typeof PageNavItemSchema>;
export type SidebarExtraItem = z.infer<typeof SidebarExtraItemSchema>;
export type SidebarConfig = z.infer<typeof SidebarConfigSchema>;
export type PageHeader = z.infer<typeof PageHeaderSchema>;
export type PageManifestEntry = z.infer<typeof PageManifestEntrySchema>;
export type PagesManifest = z.infer<typeof PagesManifestSchema>;
export type Layout = z.infer<typeof LayoutSchema>;

// ---------------------------------------------------------------------------
// NavManifest — slim version of PagesManifest (no component arrays)
// Passed server→client across the RSC boundary to the Sidebar component.
// ---------------------------------------------------------------------------

export type PageNavMeta = Pick<PageManifestEntry, 'schemaVersion' | 'title' | 'nav' | 'permissions'>;
export type NavManifest = Record<string, PageNavMeta>;
