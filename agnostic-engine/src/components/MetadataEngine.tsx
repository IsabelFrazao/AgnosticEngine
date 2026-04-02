'use client';

import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/src/components/atoms/Button';
import { Skeleton } from '@/src/components/atoms/Skeleton';
import type { MetadataComponentProps, MetadataSchemaItem } from '@/src/lib/metadata-types';

const Table = lazy(() =>
  import('@/src/components/organisms/Table').then((m) => ({ default: m.Table }))
);

type EngineComponent = React.ComponentType<MetadataComponentProps>;

const COMPONENT_MAP: Record<string, EngineComponent> = {
  button: Button,
  table: Table,
};

function buildItemProps(item: MetadataSchemaItem): MetadataComponentProps {
  return {
    ...(item.props ?? {}),
    requiredPermissions: item.permissions,
  };
}

function MetadataEngineItem({ item }: { item: MetadataSchemaItem }) {
  const Component = COMPONENT_MAP[item.type];
  if (!Component) return null;

  return (
    <ErrorBoundary fallback={<div>Error: {item.type}</div>}>
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <Component {...buildItemProps(item)} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function MetadataEngine({ schema }: { schema: MetadataSchemaItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      {schema.map((item) => (
        <MetadataEngineItem key={item.id} item={item} />
      ))}
    </div>
  );
}
