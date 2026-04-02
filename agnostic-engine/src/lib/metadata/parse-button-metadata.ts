export type ButtonMetadata = {
  labelKey: string;
  variant: 'primary' | 'secondary' | 'outline';
  isDisabled?: boolean;
};

const VARIANTS = new Set<ButtonMetadata['variant']>(['primary', 'secondary', 'outline']);

export function parseButtonMetadata(raw: Record<string, unknown> | undefined): ButtonMetadata {
  if (!raw) {
    throw new TypeError('ButtonMetadata: metadata prop is required');
  }

  const { labelKey, variant, isDisabled } = raw;

  if (typeof labelKey !== 'string' || labelKey.trim() === '') {
    throw new TypeError(
      `ButtonMetadata: "labelKey" must be a non-empty string, received ${JSON.stringify(labelKey)}`
    );
  }

  if (typeof variant !== 'string' || !VARIANTS.has(variant as ButtonMetadata['variant'])) {
    throw new TypeError(
      `ButtonMetadata: "variant" must be one of 'primary' | 'secondary' | 'outline', received ${JSON.stringify(variant)}`
    );
  }

  if (isDisabled !== undefined && typeof isDisabled !== 'boolean') {
    throw new TypeError(
      `ButtonMetadata: "isDisabled" must be a boolean or undefined, received ${JSON.stringify(isDisabled)}`
    );
  }

  return {
    labelKey,
    variant: variant as ButtonMetadata['variant'],
    ...(isDisabled !== undefined && { isDisabled }),
  };
}
