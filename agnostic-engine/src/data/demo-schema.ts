import type { MetadataSchemaItem } from '@/src/lib/metadata-types';

const DEMO_UPDATED_AT = '2026-04-01T12:00:00.000Z';

export { DEMO_UPDATED_AT };

export const demoSchema: MetadataSchemaItem[] = [
  {
    id: 'demo-theme-switcher',
    type: 'theme-switcher',
    props: { metadata: { groupLabel: 'Color theme' } },
  },
  {
    id: 'demo-button',
    type: 'button',
    props: { metadata: { labelKey: 'Metadata-driven action', variant: 'primary' } },
    permissions: ['demo:read'],
  },
  {
    id: 'demo-button-test',
    type: 'button',
    props: { metadata: { labelKey: 'New button — test', variant: 'secondary' } },
    permissions: ['demo:read'],
  },
  {
    id: 'demo-button-outline',
    type: 'button',
    props: { metadata: { labelKey: 'Outline variant', variant: 'outline' } },
    permissions: ['demo:read'],
  },
  {
    id: 'demo-button-disabled',
    type: 'button',
    props: {
      metadata: { labelKey: 'Disabled state', variant: 'outline', isDisabled: true },
    },
    permissions: ['demo:read'],
  },
  {
    id: 'demo-table',
    type: 'table',
    props: {
      metadata: {
        columns: ['Name', 'Updated (UTC string)'],
        rows: [
          {
            Name: 'Course module',
            'Updated (UTC string)': DEMO_UPDATED_AT,
          },
        ],
      },
    },
  },
];
