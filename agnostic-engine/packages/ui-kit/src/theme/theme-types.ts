import type { SVGProps } from 'react';
import type { ComponentType } from 'react';

export type ThemeId = 'system' | 'light' | 'dark' | 'ocean' | 'forest';

export interface Theme {
  id: ThemeId;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}
