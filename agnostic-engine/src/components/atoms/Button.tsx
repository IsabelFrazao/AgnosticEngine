import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import {
  parseButtonMetadata,
  type ButtonMetadata,
} from '@/src/lib/metadata/parse-button-metadata';
import { ActionRegistry } from '@/src/registry/action-registry';
import { logger } from '@/src/lib/logger';

export type { ButtonMetadata };

const BASE_CLASSES =
  'rounded-[var(--radius-brand)] px-4 py-2 text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANT_CLASSES: Record<ButtonMetadata['variant'], string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] ' +
    'hover:bg-[var(--color-primary-hover)]',
  secondary:
    'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] ' +
    'hover:bg-[var(--color-secondary-hover)]',
  outline:
    'border border-[var(--color-border)] text-[var(--color-foreground)] ' +
    'hover:bg-[var(--color-muted)]',
};

export const ButtonSkeleton = () => (
  <div
    aria-hidden="true"
    className="animate-pulse rounded-[var(--radius-brand)] bg-[var(--color-muted)] h-9 w-24"
  />
);

export function Button({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { labelKey, variant, isDisabled: metaDisabled = false, actionId } = parseButtonMetadata(metadata);

  let onClick: (() => void) | undefined;
  let isDisabled = metaDisabled;

  if (actionId !== undefined) {
    const handler = ActionRegistry.resolve(actionId);
    if (handler) {
      onClick = handler;
    } else {
      isDisabled = true;
      logger.warn(`Button "${labelKey}": actionId "${actionId}" is not registered.`);
    }
  }

  return (
    <button
      type="button"
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={labelKey}
      onClick={onClick}
    >
      {labelKey}
    </button>
  );
}
