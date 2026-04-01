'use client';

import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/src/components/atoms/Button';
import { Skeleton } from '@/src/components/atoms/Skeleton';
import type { MetadataSchemaItem } from '@/src/lib/metadata-types';

const Table = lazy(() =>
  import('@/src/components/organisms/Table').then((m) => ({ default: m.Table }))
);

const COMPONENT_MAP: Record<string, React.ComponentType<Record<string, unknown>>> =
  {
    button: Button as React.ComponentType<Record<string, unknown>>,
    table: Table as React.ComponentType<Record<string, unknown>>,
  };

export function MetadataEngine({ schema }: { schema: MetadataSchemaItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      {schema.map((item) => {
        const Component = COMPONENT_MAP[item.type];
        if (!Component) return null;

        const props = {
          ...(item.props ?? {}),
          requiredPermissions: item.permissions,
        };

        return (
          <ErrorBoundary
            key={item.id}
            fallback={<div>Error: {item.type}</div>}
          >
            <Suspense
              fallback={<Skeleton className="h-10 w-full" />}
            >
              <Component {...props} />
            </Suspense>
          </ErrorBoundary>
        );
      })}
    </div>
  );
}
