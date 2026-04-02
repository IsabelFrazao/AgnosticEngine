import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { parseTableMetadata } from '@/src/lib/metadata/parse-table-metadata';

export function Table({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { columns, rows } = parseTableMetadata(metadata);

  return (
    <table className="w-full border-collapse border border-slate-300 text-sm dark:border-slate-600">
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-medium dark:border-slate-600 dark:bg-slate-900"
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
                className="border border-slate-300 px-3 py-2 dark:border-slate-600"
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
