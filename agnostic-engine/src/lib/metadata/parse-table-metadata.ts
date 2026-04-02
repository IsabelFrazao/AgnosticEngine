export type TableMetadata = {
  columns: string[];
  rows: Record<string, unknown>[];
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseTableMetadata(raw: Record<string, unknown> | undefined): TableMetadata {
  if (!raw) {
    throw new TypeError('TableMetadata: metadata prop is required');
  }

  const { columns, rows } = raw;

  if (!Array.isArray(columns) || columns.length === 0 || !columns.every((c) => typeof c === 'string')) {
    throw new TypeError(
      `TableMetadata: "columns" must be a non-empty string array, received ${JSON.stringify(columns)}`
    );
  }

  if (!Array.isArray(rows) || !rows.every(isPlainRecord)) {
    throw new TypeError(
      `TableMetadata: "rows" must be an array of objects, received ${JSON.stringify(rows)}`
    );
  }

  return { columns, rows };
}
