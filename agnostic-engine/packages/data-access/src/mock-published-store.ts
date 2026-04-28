const DEMO_UPDATED_AT = '2026-04-01T12:00:00.000Z';

const MOCK_LAYOUT = {
  schemaVersion: '1.0',
  sidebar: {
    extras: [
      { label: 'Documentation', href: 'https://github.com/IsabelFrazao/agnostic-engine', order: 99 },
    ],
  },
  navbar: [],
  footer: [],
  notifications: [],
};

const MOCK_PAGES = {
  '/': {
    schemaVersion: '1.0',
    title: 'Home',
    nav: { label: 'Home', order: 0 },
    permissions: [],
    header: {
      title: 'AgnosticEngine',
      description: 'A metadata-driven UI engine. The schema below is live - edit it and the UI updates.',
    },
    components: [
      {
        id: 'nested-actions-group',
        type: 'table',
        props: {
          metadata: {
            columns: ['Section'],
            rows: [{ Section: 'Nested children (recursive tree demo)' }],
          },
        },
        children: [
          {
            id: 'nested-child-button',
            type: 'button',
            props: {
              metadata: { labelKey: 'Child of table node', variant: 'secondary', actionId: 'demo:log' },
            },
          },
        ],
      },
      {
        id: 'page-theme-switcher',
        type: 'theme-switcher',
        props: {
          metadata: { groupLabel: 'Color theme' },
        },
      },
    ],
  },
  '/courses': {
    schemaVersion: '1.0',
    title: 'Courses',
    nav: { label: 'Courses', order: 1 },
    permissions: ['courses:read'],
    header: {
      title: 'Courses',
      description: 'Manage your learning modules.',
    },
    components: [
      {
        id: 'courses-table',
        type: 'table',
        props: {
          metadata: {
            columns: ['Module', 'Status', 'Last Updated'],
            rows: [
              { Module: 'Introduction to TypeScript', Status: 'Published', 'Last Updated': '2026-03-28T09:00:00.000Z' },
              { Module: 'React 19 Fundamentals', Status: 'Draft', 'Last Updated': '2026-04-01T14:30:00.000Z' },
              { Module: 'Next.js App Router', Status: 'In Review', 'Last Updated': '2026-04-02T11:15:00.000Z' },
              { Module: 'Metadata-Driven UI', Status: 'Draft', 'Last Updated': '2026-04-03T08:45:00.000Z' },
            ],
          },
        },
        permissions: ['courses:read'],
      },
      {
        id: 'action-publish',
        type: 'button',
        props: { metadata: { labelKey: 'Publish module', variant: 'primary', actionId: 'courses:publish' } },
        permissions: ['courses:write'],
      },
      {
        id: 'action-save-draft',
        type: 'button',
        props: { metadata: { labelKey: 'Save as draft', variant: 'secondary', actionId: 'courses:save-draft' } },
        permissions: ['courses:write'],
      },
      {
        id: 'action-preview',
        type: 'button',
        props: { metadata: { labelKey: 'Preview', variant: 'outline', actionId: 'courses:preview' } },
        permissions: ['courses:read'],
      },
      {
        id: 'action-archive',
        type: 'button',
        props: { metadata: { labelKey: 'Archive', variant: 'outline', isDisabled: true, actionId: 'courses:archive' } },
        permissions: ['courses:admin'],
      },
    ],
  },
  '/courses/modules': {
    schemaVersion: '1.0',
    title: 'Modules',
    nav: { label: 'Modules', order: 0, parent: '/courses' },
    permissions: ['courses:read'],
    header: {
      title: 'Modules',
      description: 'Individual course modules. Components will be added here.',
    },
    components: [],
  },
} satisfies Record<string, unknown>;

export const MOCK_PUBLISHED_STORE = {
  updatedAt: DEMO_UPDATED_AT,
  layout: MOCK_LAYOUT,
  pages: MOCK_PAGES,
};
