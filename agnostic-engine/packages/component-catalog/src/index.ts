export type ComponentType = 'button' | 'table' | 'theme-switcher';

export type InspectorFieldKind = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';

export type InspectorFieldConfig = {
  key: string;
  label: string;
  kind: InspectorFieldKind;
  required?: boolean;
  options?: string[];
};

export type ComponentCatalogEntry = {
  type: ComponentType;
  label: string;
  category: 'actions' | 'data' | 'theme';
  supportsChildren: boolean;
  defaultMetadata: Record<string, unknown>;
  inspectorFields: InspectorFieldConfig[];
};

export const COMPONENT_CATALOG = [
  {
    type: 'button',
    label: 'Button',
    category: 'actions',
    supportsChildren: false,
    defaultMetadata: {
      labelKey: 'Builder Added Button',
      variant: 'secondary',
      actionId: 'demo:log',
    },
    inspectorFields: [
      { key: 'labelKey', label: 'Label', kind: 'string', required: true },
      { key: 'variant', label: 'Variant', kind: 'enum', options: ['primary', 'secondary', 'outline'] },
      { key: 'actionId', label: 'Action ID', kind: 'string' },
      { key: 'isDisabled', label: 'Disabled', kind: 'boolean' },
    ],
  },
  {
    type: 'table',
    label: 'Table',
    category: 'data',
    supportsChildren: true,
    defaultMetadata: {
      columns: ['Col'],
      rows: [{ Col: 'New row' }],
    },
    inspectorFields: [
      { key: 'columns', label: 'Columns', kind: 'array', required: true },
      { key: 'rows', label: 'Rows', kind: 'array', required: true },
      { key: 'caption', label: 'Caption', kind: 'string' },
    ],
  },
  {
    type: 'theme-switcher',
    label: 'Theme Switcher',
    category: 'theme',
    supportsChildren: false,
    defaultMetadata: {
      groupLabel: 'Builder Added Theme Switcher',
    },
    inspectorFields: [
      { key: 'groupLabel', label: 'Group Label', kind: 'string' },
      { key: 'visibleThemes', label: 'Visible Themes', kind: 'array' },
    ],
  },
] as const satisfies readonly ComponentCatalogEntry[];

export const COMPONENT_TYPES = COMPONENT_CATALOG.map((entry) => entry.type) as readonly ComponentType[];

export const COMPONENT_CATALOG_BY_TYPE: Record<ComponentType, ComponentCatalogEntry> = COMPONENT_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.type] = entry;
    return acc;
  },
  {} as Record<ComponentType, ComponentCatalogEntry>,
);

export function createDefaultComponentMetadata(type: ComponentType): Record<string, unknown> {
  return JSON.parse(JSON.stringify(COMPONENT_CATALOG_BY_TYPE[type].defaultMetadata)) as Record<string, unknown>;
}
