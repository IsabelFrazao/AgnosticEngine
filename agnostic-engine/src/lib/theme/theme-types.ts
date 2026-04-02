import type React from 'react';

export type ThemeId = 'system' | 'light' | 'dark' | 'ocean' | 'forest';

export interface Theme {
  id: ThemeId;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

