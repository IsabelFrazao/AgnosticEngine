import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import {
  parseButtonMetadata,
  type ButtonMetadata,
} from '@/src/lib/metadata/parse-button-metadata';
import { resolveAction } from '@/src/lib/resolve-action';
import { Button as UiButton } from '@agnostic/ui-kit';

export type { ButtonMetadata };

export function Button({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { labelKey, variant, isDisabled: metaDisabled = false, actionId } = parseButtonMetadata(metadata);

  const { handler: onClick, forceDisabled } = resolveAction(actionId, labelKey);
  const isDisabled = metaDisabled || forceDisabled;

  return <UiButton label={labelKey} variant={variant} isDisabled={isDisabled} onClick={onClick} />;
}
