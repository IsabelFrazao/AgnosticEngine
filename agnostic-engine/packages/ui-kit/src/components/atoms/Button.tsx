const BASE_CLASSES =
  'rounded-(--radius-brand) px-4 py-2 text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-(--color-primary) text-(--color-primary-foreground) hover:bg-(--color-primary-hover)',
  secondary: 'bg-(--color-secondary) text-(--color-secondary-foreground) hover:bg-(--color-secondary-hover)',
  outline: 'border border-(--color-border) text-(--color-foreground) hover:bg-(--color-muted)',
};

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

type Props = {
  label: string;
  variant: ButtonVariant;
  isDisabled?: boolean;
  onClick?: () => void;
};

export function Button({ label, variant, isDisabled = false, onClick }: Props) {
  return (
    <button
      type="button"
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={label}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
