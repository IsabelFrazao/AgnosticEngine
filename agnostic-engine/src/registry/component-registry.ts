import type { ComponentType as ReactComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import type { ComponentType } from '@/src/schemas/atoms';
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
export const COMPONENT_MAP: Record<ComponentType, EngineComponent> = {
  button:           Button,
  table:            Table,
  'theme-switcher': ThemeSwitcher,
};
