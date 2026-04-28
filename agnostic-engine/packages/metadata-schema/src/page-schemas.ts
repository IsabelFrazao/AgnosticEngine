import { z } from 'zod';
import { CURRENT_SCHEMA_VERSION } from './schema-version';

export function createPageSchemas<TMetadataNode>(
  metadataNodeSchema: z.ZodType<TMetadataNode>,
) {
  const SchemaVersionSchema = z.literal(CURRENT_SCHEMA_VERSION);

  const PageNavItemSchema = z.object({
    label: z.string().min(1),
    order: z.number().int(),
    parent: z.string().startsWith('/').optional(),
    icon: z.string().optional(),
  });

  const SidebarExtraItemSchema = z.object({
    label: z.string().min(1),
    href: z.string().url(),
    order: z.number().int(),
    icon: z.string().optional(),
  });

  const SidebarConfigSchema = z.object({
    extras: z.array(SidebarExtraItemSchema).default([]),
  });

  const PageHeaderSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  });

  const PageManifestEntrySchema = z.object({
    schemaVersion: SchemaVersionSchema.default(CURRENT_SCHEMA_VERSION),
    title: z.string().min(1),
    nav: PageNavItemSchema.optional(),
    permissions: z.array(z.string()).default([]),
    header: PageHeaderSchema.optional(),
    components: z.array(metadataNodeSchema),
  });

  const PagesManifestSchema = z.record(
    z.string().startsWith('/'),
    PageManifestEntrySchema,
  );

  const LayoutSchema = z.object({
    schemaVersion: SchemaVersionSchema.default(CURRENT_SCHEMA_VERSION),
    sidebar: SidebarConfigSchema.default({ extras: [] }),
    navbar: z.array(metadataNodeSchema).default([]),
    footer: z.array(metadataNodeSchema).default([]),
    notifications: z.array(metadataNodeSchema).default([]),
  });

  return {
    SchemaVersionSchema,
    PageNavItemSchema,
    SidebarExtraItemSchema,
    SidebarConfigSchema,
    PageHeaderSchema,
    PageManifestEntrySchema,
    PagesManifestSchema,
    LayoutSchema,
  };
}
