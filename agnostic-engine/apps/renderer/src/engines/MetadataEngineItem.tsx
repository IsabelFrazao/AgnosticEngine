'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { DegradedStateUI, Skeleton } from '@agnostic/ui-kit';
import { COMPONENT_MAP } from '@/src/registry/component-registry';
import { MetadataNodeSchema } from '@/src/schemas/root.schema';
import {
  evaluatePermissionAccess,
  extendMetadataAncestorIds,
  MAX_METADATA_TREE_DEPTH,
  resolveMetadataAncestorIds,
  sanitizeMetadata,
} from '@agnostic/engine-core';
import { logger } from '@/src/lib/logger';
import type { MetadataComponentProps, MetadataSchemaItem } from '@/src/lib/metadata-types';

/**
 * Extracts the two known MetadataComponentProps keys from a validated node.
 * Spreading the full node would silently forward unknown fields into components.
 */
function buildItemProps(item: {
  props?: Record<string, unknown>;
  permissions?: string[] | undefined;
}): MetadataComponentProps {
  const rawMeta = item.props?.metadata;
  return {
    metadata:
      rawMeta !== undefined &&
      typeof rawMeta === 'object' &&
      rawMeta !== null &&
      !Array.isArray(rawMeta)
        ? (rawMeta as Record<string, unknown>)
        : undefined,
    requiredPermissions: item.permissions,
  };
}

/**
 * Validates → sanitizes → renders one metadata node.
 * Handles child recursion; renders DegradedStateUI on any failure.
 *
 * Law of Validation: raw metadata never bypasses this pipeline.
 */
export function MetadataEngineItem({
  item,
  currentUserPermissions,
  depth = 0,
  ancestorIds,
}: {
  item: MetadataSchemaItem;
  currentUserPermissions?: string[];
  depth?: number;
  ancestorIds?: ReadonlySet<string>;
}) {
  // Stage 1: Schema validation
  const parsed = MetadataNodeSchema.safeParse(item);

  if (!parsed.success) {
    logger.error(
      `Schema validation failed for item "${item.id ?? '(unknown)'}" (type: "${String(item.type ?? '(unknown)')}")`,
      parsed.error.issues,
    );
    return (
      <DegradedStateUI
        itemId={item.id ?? '(unknown)'}
        itemType={String(item.type ?? '(unknown)')}
        reason="invalid-schema"
      />
    );
  }

  const node = parsed.data;
  const resolvedAncestors = resolveMetadataAncestorIds(ancestorIds);

  if (resolvedAncestors.has(node.id)) {
    logger.warn(`Metadata cycle detected at "${node.type}"`, {
      id: node.id,
    });
    return (
      <DegradedStateUI itemId={node.id} itemType={node.type} reason="cycle-detected" />
    );
  }

  if (depth >= MAX_METADATA_TREE_DEPTH) {
    logger.warn(`Max metadata depth exceeded for "${node.type}"`, {
      id: node.id,
      depth,
      maxDepth: MAX_METADATA_TREE_DEPTH,
    });
    return (
      <DegradedStateUI
        itemId={node.id}
        itemType={node.type}
        reason="max-depth-exceeded"
      />
    );
  }

  const access = evaluatePermissionAccess(node.permissions, currentUserPermissions);

  if (!access.allowed) {
    logger.warn(`Permission denied for "${node.type}"`, {
      id: node.id,
      requiredPermissions: node.permissions ?? [],
      missingPermissions: access.missingPermissions,
    });
    return (
      <DegradedStateUI
        itemId={node.id}
        itemType={node.type}
        reason="insufficient-permissions"
      />
    );
  }

  // Stage 2: Content sanitization (structural fields are not user content)
  const sanitizedProps = node.props
    ? (sanitizeMetadata(node.props) as Record<string, unknown>)
    : undefined;

  // Registry lookup — guaranteed by Record<ComponentType, ...> but cast defensively
  // in case schema and registry drift at runtime.
  const Component = COMPONENT_MAP[node.type] as (typeof COMPONENT_MAP)[typeof node.type] | undefined;
  if (!Component) {
    logger.error(`No component registered for type "${node.type}"`, { id: node.id });
    return <DegradedStateUI itemId={node.id} itemType={node.type} reason="unknown-type" />;
  }

  return (
    <ErrorBoundary
      fallback={
        <DegradedStateUI itemId={node.id} itemType={node.type} reason="render-error" />
      }
      onError={(error) => logger.error(`"${node.type}" failed to render`, error)}
    >
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <div className="flex flex-col gap-4">
          <Component {...buildItemProps({ ...node, props: sanitizedProps })} />
          {node.children?.length ? (
            <div className="flex flex-col gap-4">
              {node.children.map((child) => (
                <MetadataEngineItem
                  key={child.id}
                  item={child}
                  currentUserPermissions={currentUserPermissions}
                  depth={depth + 1}
                  ancestorIds={extendMetadataAncestorIds(resolvedAncestors, node.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
