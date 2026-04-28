import type { ReactNode } from 'react';
import { FormattedUtc } from '../atoms/FormattedUtc';
import { parseUtcIso } from '../../datetime/utc-display';

type RowData = Record<string, unknown>;

type Props = {
  columns: string[];
  rows: RowData[];
  caption?: string;
};

function renderTableCellValue(value: unknown): ReactNode {
  if (typeof value === 'string' && parseUtcIso(value)) {
    return <FormattedUtc iso={value} />;
  }
  return String(value ?? '');
}

export function Table({ columns, rows, caption }: Props) {
  const fallbackLabel = `Table with columns: ${columns.join(', ')}`;

  return (
    <table
      className="w-full border-collapse border border-(--color-table-border) text-sm"
      aria-label={!caption ? fallbackLabel : undefined}
    >
      {caption && <caption className="mb-2 text-left text-sm font-medium text-(--color-foreground)">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              scope="col"
              className="border border-(--color-table-border) bg-(--color-table-header) px-3 py-2 text-left font-medium"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={columns.map((column) => String(row[column] ?? '')).join('||')}>
            {columns.map((column) => (
              <td key={column} className="border border-(--color-table-border) px-3 py-2">
                {renderTableCellValue(row[column])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
