import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import {
  parseButtonMetadata,
  type ButtonMetadata,
} from '@/src/lib/metadata/parse-button-metadata';
import { resolveAction } from '@/src/lib/resolve-action';

export type { ButtonMetadata };

// Note: ThemeSwitcher uses a similar base pattern (same radius/ring/typography tokens)
// but differs in size (px-3 py-1.5) and layout (flex + gap). Extract a shared
// buttonBaseClasses() utility to src/lib/ if a third button-like component appears.
const BASE_CLASSES =
  'rounded-(--radius-brand) px-4 py-2 text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANT_CLASSES: Record<ButtonMetadata['variant'], string> = {
  primary:
    'bg-(--color-primary) text-(--color-primary-foreground) ' +
    'hover:bg-(--color-primary-hover)',
  secondary:
    'bg-(--color-secondary) text-(--color-secondary-foreground) ' +
    'hover:bg-(--color-secondary-hover)',
  outline:
    'border border-(--color-border) text-(--color-foreground) ' +
    'hover:bg-(--color-muted)',
};

export function Button({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { labelKey, variant, isDisabled: metaDisabled = false, actionId } = parseButtonMetadata(metadata);

  const { handler: onClick, forceDisabled } = resolveAction(actionId, labelKey);
  const isDisabled = metaDisabled || forceDisabled;

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
