import type { ButtonHTMLAttributes } from 'react';
import type { MetadataComponentProps } from '@/src/lib/metadata-types';

export function Button({
  metadata,
  requiredPermissions: _requiredPermissions,
  children,
  className,
  label,
  ...rest
}: MetadataComponentProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) {
  const text =
    children ??
    (typeof metadata?.label === 'string' ? metadata.label : label) ??
    'Button';
  return (
    <button
      type="button"
      className={
        className ??
        'rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
      }
      {...rest}
    >
      {text}
    </button>
  );
}
