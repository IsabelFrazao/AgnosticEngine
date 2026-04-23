import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Table } from '@/src/components/organisms/Table';

describe('Table', () => {
  it('renders ISO UTC strings with FormattedUtc time element', () => {
    const html = renderToStaticMarkup(
      <Table
        metadata={{
          columns: ['Last Updated'],
          rows: [{ 'Last Updated': '2026-03-28T09:00:00.000Z' }],
        }}
      />,
    );

    expect(html).toContain('<time');
    expect(html).toContain('dateTime="2026-03-28T09:00:00.000Z"');
  });
});
