import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MetadataEngineItem } from '../MetadataEngineItem';

describe('MetadataEngineItem permission enforcement', () => {
  const securedButtonNode = {
    id: 'secure-action',
    type: 'button' as const,
    props: {
      metadata: {
        labelKey: 'Secure action',
        variant: 'primary' as const,
      },
    },
    permissions: ['courses:write'],
  };

  it('renders degraded state when permissions are missing', () => {
    const html = renderToStaticMarkup(
      <MetadataEngineItem item={securedButtonNode} currentUserPermissions={['courses:read']} />,
    );

    expect(html).toContain('Component unavailable');
    expect(html).toContain('insufficient-permissions');
    expect(html).not.toContain('Secure action');
  });

  it('renders the component when permissions are granted', () => {
    const html = renderToStaticMarkup(
      <MetadataEngineItem item={securedButtonNode} currentUserPermissions={['courses:write']} />,
    );

    expect(html).toContain('Secure action');
    expect(html).not.toContain('Component unavailable');
  });
});
