'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/src/components/atoms/Button';
import { Skeleton } from '@/src/components/atoms/Skeleton';
import { ThemeSwitcher } from '@/src/components/atoms/ThemeSwitcher';
import { DegradedStateUI } from '@/src/components/atoms/DegradedStateUI';
import { MetadataNodeSchema } from '@/src/schemas/root.schema';
import { sanitizeMetadata } from '@/src/utils/sanitize';
import { logger } from '@/src/lib/logger';
import type { MetadataComponentProps, MetadataSchemaItem } from '@/src/lib/metadata-types';

const Table = dynamic(() =>
  import('@/src/components/organisms/Table').then((m) => ({ default: m.Table })),
);

type EngineComponent = React.ComponentType<MetadataComponentProps>;

const COMPONENT_MAP: Record<string, EngineComponent> = {
  button:          Button,
  table:           Table,
  'theme-switcher': ThemeSwitcher,
};

function buildItemProps(item: {
  props?: Record<string, unknown>;
  permissions?: string[] | undefined;
}): MetadataComponentProps {
  const rawMeta = item.props?.metadata;
  return {
    metadata:
      rawMeta !== undefined && typeof rawMeta === 'object' && rawMeta !== null && !Array.isArray(rawMeta)
        ? (rawMeta as Record<string, unknown>)
        : undefined,
    requiredPermissions: item.permissions,
  };
}

export function MetadataEngineItem({ item }: { item: MetadataSchemaItem }) {
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
  const sanitizedProps = node.props
    ? (sanitizeMetadata(node.props) as Record<string, unknown>)
    : undefined;

  const Component = COMPONENT_MAP[node.type];
  if (!Component) {
    logger.error(`No engine component registered for type "${node.type}"`, { id: node.id });
    return (
      <DegradedStateUI itemId={node.id} itemType={node.type} reason="unknown-type" />
    );
  }

  const childItems = node.children;

  return (
    <ErrorBoundary
      fallback={
        <DegradedStateUI itemId={node.id} itemType={node.type} reason="invalid-schema" />
      }
      onError={(error) => logger.error(`"${node.type}" failed to render`, error)}
    >
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <div className="flex flex-col gap-4">
          <Component {...buildItemProps({ ...node, props: sanitizedProps })} />
          {childItems?.length ? (
            <div className="flex flex-col gap-4">
              {childItems.map((child) => (
                <MetadataEngineItem key={child.id} item={child} />
              ))}
            </div>
          ) : null}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
