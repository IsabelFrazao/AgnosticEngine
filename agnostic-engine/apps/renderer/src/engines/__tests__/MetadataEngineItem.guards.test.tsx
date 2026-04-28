import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@agnostic/engine-core', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@agnostic/engine-core')>();
  return {
    ...mod,
    MAX_METADATA_TREE_DEPTH: 2,
  };
});

import type { MetadataSchemaItem } from '@/src/lib/metadata-types';
import { MetadataEngineItem } from '../MetadataEngineItem';

function button(
  id: string,
  labelKey: string,
  children?: MetadataSchemaItem[],
): MetadataSchemaItem {
  return {
    id,
    type: 'button',
    props: {
      metadata: {
        labelKey,
        variant: 'primary',
      },
    },
    ...(children?.length ? { children } : {}),
  };
}

describe('MetadataEngineItem tree guards', () => {
  it('degrades when max depth is exceeded', () => {
    const tree = button('root', 'R', [button('mid', 'M', [button('deep', 'D')])]);
    const html = renderToStaticMarkup(
      <MetadataEngineItem item={tree} currentUserPermissions={[]} />,
    );

    expect(html).toContain('max-depth-exceeded');
    expect(html).toContain('deep');
    expect(html).toContain('R');
    expect(html).toContain('M');
  });

  it('degrades when a cycle is detected', () => {
    const cycle = button('a', 'A', [
      button('b', 'B', [button('a', 'A-again')]),
    ]);
    const html = renderToStaticMarkup(
      <MetadataEngineItem item={cycle} currentUserPermissions={[]} />,
    );

    expect(html).toContain('cycle-detected');
  });
});
