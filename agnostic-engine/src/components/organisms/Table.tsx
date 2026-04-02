import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { parseTableMetadata } from '@/src/lib/metadata/parse-table-metadata';

export function Table({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { columns, rows } = parseTableMetadata(metadata);

  return (
    <table className="w-full border-collapse border border-[var(--color-table-border)] text-sm">
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              className="border border-[var(--color-table-border)] bg-[var(--color-table-header)] px-3 py-2 text-left font-medium"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((c) => (
              <td
                key={c}
                className="border border-[var(--color-table-border)] px-3 py-2"
              >
                {String(row[c] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
