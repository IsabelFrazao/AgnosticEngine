'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/src/components/atoms/Button';
import { Skeleton } from '@/src/components/atoms/Skeleton';
import type { MetadataComponentProps, MetadataSchemaItem } from '@/src/lib/metadata-types';

const Table = dynamic(() =>
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

export function MetadataEngineItem({ item }: { item: MetadataSchemaItem }) {
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
