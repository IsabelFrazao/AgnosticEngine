import { z } from 'zod';
import { MetadataNodeSchema } from '@/src/schemas/root.schema';

// ---------------------------------------------------------------------------
// Sidebar nav item — declared on the page, not on the sidebar
// ---------------------------------------------------------------------------

export const PageNavItemSchema = z.object({
  label:  z.string().min(1),
  /** JS sort key applied before DOM render. Not the CSS `order` property. */
  order:  z.number().int(),
  /**
   * Slug of the parent page. Presence nests this item under its parent in
   * the sidebar automatically. Absence = root-level item.
   */
  parent: z.string().startsWith('/').optional(),
  /** Reserved for future icon support. No icon library is installed yet. */
  icon:   z.string().optional(),
});

export type PageNavItem = z.infer<typeof PageNavItemSchema>;

// ---------------------------------------------------------------------------
// Sidebar extras — escape hatch for non-page nav items only
// ---------------------------------------------------------------------------

export const SidebarExtraItemSchema = z.object({
  label: z.string().min(1),
  href:  z.string().url(),
  /** JS sort key, merged with page nav items when building the final nav tree. */
  order: z.number().int(),
  icon:  z.string().optional(),
});

export type SidebarExtraItem = z.infer<typeof SidebarExtraItemSchema>;

export const SidebarConfigSchema = z.object({
  /**
   * Non-page nav entries (external links, dividers). This is the exception —
   * all internal pages must declare nav via their page entry, not here.
   */
  extras: z.array(SidebarExtraItemSchema).default([]),
});

export type SidebarConfig = z.infer<typeof SidebarConfigSchema>;

// ---------------------------------------------------------------------------
// Page header — per-page title/description slot
// ---------------------------------------------------------------------------

export const PageHeaderSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
});

export type PageHeader = z.infer<typeof PageHeaderSchema>;

// ---------------------------------------------------------------------------
// Page manifest entry — content + nav in one place (Law of Derivation)
// ---------------------------------------------------------------------------

export const PageManifestEntrySchema = z.object({
  title:       z.string().min(1),
  /**
   * Presence = page appears in sidebar.
   * Absence = page exists and is routable, but is not listed in the nav.
   */
  nav:         PageNavItemSchema.optional(),
  permissions: z.array(z.string()).default([]),
  header:      PageHeaderSchema.optional(),
  components:  z.array(MetadataNodeSchema),
});

export type PageManifestEntry = z.infer<typeof PageManifestEntrySchema>;

// ---------------------------------------------------------------------------
// Pages manifest — record keyed by slug (e.g. "/", "/courses")
// ---------------------------------------------------------------------------

export const PagesManifestSchema = z.record(
  z.string().startsWith('/'),
  PageManifestEntrySchema,
);

export type PagesManifest = z.infer<typeof PagesManifestSchema>;

// ---------------------------------------------------------------------------
// Layout schema — shared shell components
// ---------------------------------------------------------------------------

export const LayoutSchema = z.object({
  sidebar:       SidebarConfigSchema.default({ extras: [] }),
  navbar:        z.array(MetadataNodeSchema).default([]),
  footer:        z.array(MetadataNodeSchema).default([]),
  notifications: z.array(MetadataNodeSchema).default([]),
});

export type Layout = z.infer<typeof LayoutSchema>;

// ---------------------------------------------------------------------------
// NavManifest — slim version of PagesManifest (no component arrays)
// Passed server→client across the RSC boundary to the Sidebar component.
// ---------------------------------------------------------------------------

export type PageNavMeta = Pick<PageManifestEntry, 'title' | 'nav' | 'permissions'>;
export type NavManifest = Record<string, PageNavMeta>;
