import type { ComponentType as ReactComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { COMPONENT_TYPES, type ComponentType } from '@agnostic/component-catalog';
import { Button } from '@/src/components/atoms/Button';
import { ThemeSwitcher } from '@/src/components/atoms/ThemeSwitcher';

const Table = dynamic(() =>
  import('@/src/components/organisms/Table').then((m) => ({ default: m.Table })),
);

type EngineComponent = ReactComponentType<MetadataComponentProps>;

/**
 * Registry linking `type` strings to React components.
 *
 * Law of Discovery: every new Atom MUST have an entry here.
 * TypeScript enforces completeness: if a type exists in ATOM_SCHEMAS
 * but is missing here, you get a compile error on the Record type.
 */
const RAW_COMPONENT_MAP = {
  button:           Button,
  table:            Table,
  'theme-switcher': ThemeSwitcher,
} satisfies Record<ComponentType, EngineComponent>;

export const COMPONENT_MAP = Object.fromEntries(
  COMPONENT_TYPES.map((type) => [type, RAW_COMPONENT_MAP[type]]),
) as Record<ComponentType, EngineComponent>;
