import {
  createDefaultComponentMetadata,
  type ComponentType,
} from '@agnostic/component-catalog';

type RecordLike = Record<string, unknown>;

export type DraftSiteVersion = {
  siteSlug: string;
  schemaVersion: string;
  layout: unknown;
  pages: Record<string, unknown>;
  updatedAt: string;
};

export type BuilderItem = {
  id: string;
  type: ComponentType;
  metadata: RecordLike;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

export type BuilderSection = {
  id: string;
  title: string;
  mode: 'stack' | 'free';
  items: BuilderItem[];
};

export type BuilderPage = {
  slug: string;
  title: string;
  navLabel: string;
  navOrder: number;
  sections: BuilderSection[];
};

export type BuilderState = {
  siteSlug: string;
  schemaVersion: string;
  layout: RecordLike;
  pages: BuilderPage[];
};

type BuilderPersisted = {
  sections?: Array<{
    id?: string;
    title?: string;
    mode?: 'stack' | 'free';
    items?: Array<{
      id?: string;
      type?: ComponentType;
      x?: number;
      y?: number;
      w?: number;
      h?: number;
      z?: number;
    }>;
  }>;
};

function asRecord(value: unknown): RecordLike | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as RecordLike;
}

function slugToTitle(slug: string): string {
  if (slug === '/') return 'Home';
  return slug
    .replace(/^\//, '')
    .split('/')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sanitizeSlug(input: string): string {
  const normalized = input.trim().toLowerCase();
  if (!normalized || normalized === '/') return '/';
  const slug = normalized
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9/_-]/g, '')
    .replace(/\/{2,}/g, '/');
  if (!slug) return '/';
  return slug.startsWith('/') ? slug : `/${slug}`;
}

function ensureRootPage(pages: BuilderPage[]): BuilderPage[] {
  if (pages.some((page) => page.slug === '/')) return pages;
  return [
    {
      slug: '/',
      title: 'Home',
      navLabel: 'Home',
      navOrder: 0,
      sections: [{ id: 'section-main', title: 'Main', mode: 'free', items: [] }],
    },
    ...pages.map((page, index) => ({ ...page, navOrder: index + 1 })),
  ];
}

function readPersisted(pageRecord: RecordLike): BuilderPersisted | null {
  const persisted = asRecord(pageRecord.__builder);
  if (!persisted) return null;
  return persisted as BuilderPersisted;
}

function fallbackItem(type: ComponentType, index: number): BuilderItem {
  return {
    id: `item-${type}-${Date.now()}-${index}`,
    type,
    metadata: createDefaultComponentMetadata(type),
    x: 20,
    y: 20 + index * 90,
    w: 240,
    h: 76,
    z: index,
  };
}

function toBuilderItem(raw: unknown, index: number): BuilderItem | null {
  const node = asRecord(raw);
  if (!node) return null;
  const type = node.type;
  if (type !== 'button' && type !== 'table' && type !== 'theme-switcher') return null;
  const props = asRecord(node.props);
  const metadata = asRecord(props?.metadata) ?? createDefaultComponentMetadata(type);
  const id = typeof node.id === 'string' && node.id ? node.id : `item-${type}-${Date.now()}-${index}`;
  return {
    id,
    type,
    metadata,
    x: 20,
    y: 20 + index * 90,
    w: 240,
    h: 76,
    z: index,
  };
}

function createSectionFromComponents(components: unknown[]): BuilderSection {
  const items = components.map((component, index) => toBuilderItem(component, index)).filter((item): item is BuilderItem => item !== null);
  return {
    id: 'section-main',
    title: 'Main',
    mode: 'free',
    items,
  };
}

function hydratePersistedSections(baseSection: BuilderSection, persisted: BuilderPersisted | null): BuilderSection[] {
  const persistedSections = persisted?.sections;
  if (!persistedSections || persistedSections.length === 0) return [baseSection];

  const byId = new Map(baseSection.items.map((item) => [item.id, item]));
  const sections: BuilderSection[] = persistedSections.map((section, sectionIndex) => {
    const items = (section.items ?? [])
      .map((item, itemIndex) => {
        const id = typeof item.id === 'string' ? item.id : '';
        const existing = byId.get(id);
        if (!existing) return null;
        return {
          ...existing,
          x: typeof item.x === 'number' ? item.x : existing.x,
          y: typeof item.y === 'number' ? item.y : existing.y,
          w: typeof item.w === 'number' ? item.w : existing.w,
          h: typeof item.h === 'number' ? item.h : existing.h,
          z: typeof item.z === 'number' ? item.z : itemIndex,
        };
      })
      .filter((item): item is BuilderItem => item !== null);
    return {
      id: typeof section.id === 'string' && section.id ? section.id : `section-${sectionIndex + 1}`,
      title: typeof section.title === 'string' && section.title ? section.title : `Section ${sectionIndex + 1}`,
      mode: section.mode === 'stack' ? 'stack' : 'free',
      items,
    };
  });

  const usedIds = new Set(sections.flatMap((section) => section.items.map((item) => item.id)));
  const leftovers = baseSection.items.filter((item) => !usedIds.has(item.id));
  if (leftovers.length > 0) {
    sections[0] = { ...sections[0], items: [...sections[0].items, ...leftovers] };
  }

  return sections.length > 0 ? sections : [baseSection];
}

export function createNewPage(inputSlug: string, order: number): BuilderPage {
  const slug = sanitizeSlug(inputSlug);
  const title = slugToTitle(slug);
  return {
    slug,
    title,
    navLabel: title,
    navOrder: order,
    sections: [{ id: 'section-main', title: 'Main', mode: 'free', items: [] }],
  };
}

export function createBuilderStateFromDraft(draft: DraftSiteVersion): BuilderState {
  const layoutRecord = asRecord(draft.layout) ?? {};
  const pages = Object.entries(draft.pages)
    .map(([slug, value]) => {
      const pageRecord = asRecord(value) ?? {};
      const nav = asRecord(pageRecord.nav) ?? {};
      const components = Array.isArray(pageRecord.components) ? pageRecord.components : [];
      const baseSection = createSectionFromComponents(components);
      const sections = hydratePersistedSections(baseSection, readPersisted(pageRecord));
      return {
        slug,
        title: typeof pageRecord.title === 'string' ? pageRecord.title : slugToTitle(slug),
        navLabel: typeof nav.label === 'string' ? nav.label : slugToTitle(slug),
        navOrder: typeof nav.order === 'number' ? nav.order : 0,
        sections,
      } as BuilderPage;
    })
    .sort((a, b) => a.navOrder - b.navOrder || a.slug.localeCompare(b.slug));

  return {
    siteSlug: draft.siteSlug,
    schemaVersion: draft.schemaVersion,
    layout: layoutRecord,
    pages: ensureRootPage(pages),
  };
}

export function createDraftPayloadFromBuilderState(state: BuilderState): {
  schemaVersion: string;
  layout: RecordLike;
  pages: Record<string, unknown>;
} {
  const pages = Object.fromEntries(
    state.pages.map((page, pageIndex) => {
      const components = page.sections.flatMap((section) =>
        section.items.map((item) => ({
          id: item.id,
          type: item.type,
          props: { metadata: item.metadata },
        })),
      );

      const persistedSections = page.sections.map((section) => ({
        id: section.id,
        title: section.title,
        mode: section.mode,
        items: section.items.map((item) => ({
          id: item.id,
          type: item.type,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          z: item.z,
        })),
      }));

      return [
        page.slug,
        {
          schemaVersion: state.schemaVersion,
          title: page.title,
          nav: { label: page.navLabel, order: pageIndex, ...(page.slug.includes('/') && page.slug !== '/' ? { parent: `/${page.slug.split('/').filter(Boolean)[0]}` } : {}) },
          permissions: [],
          header: {
            title: page.title,
            description: `Built in Builder Studio for ${page.slug}.`,
          },
          components,
          __builder: { sections: persistedSections },
        },
      ];
    }),
  );

  return {
    schemaVersion: state.schemaVersion,
    layout: state.layout,
    pages,
  };
}

export function validateBuilderState(state: BuilderState): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  const hasRoot = state.pages.some((page) => page.slug === '/');
  if (!hasRoot) issues.push('Pages must include "/" root page.');

  state.pages.forEach((page) => {
    if (seen.has(page.slug)) issues.push(`Duplicate page slug: ${page.slug}`);
    seen.add(page.slug);
    if (!page.sections.length) issues.push(`Page ${page.slug} has no sections.`);
    page.sections.forEach((section) => {
      if (!section.items.length) return;
      section.items.forEach((item) => {
        if (!item.id) issues.push(`Page ${page.slug} has an item with no id.`);
      });
    });
  });

  return issues;
}

export function moveInArray<T>(source: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= source.length || toIndex >= source.length) {
    return source;
  }
  const copy = [...source];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export function createPaletteItem(type: ComponentType): BuilderItem {
  return fallbackItem(type, 0);
}

