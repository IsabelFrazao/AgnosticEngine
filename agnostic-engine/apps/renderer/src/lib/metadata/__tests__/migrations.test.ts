import { describe, expect, it } from 'vitest';
import { migrateLayout } from '@/src/lib/metadata/migrate-layout';
import { migratePageManifestEntry } from '@/src/lib/metadata/migrate-page-manifest-entry';

describe('metadata migrations', () => {
  it('fills missing layout schemaVersion with current version', () => {
    const migrated = migrateLayout({
      sidebar: { extras: [] },
      navbar: [],
      footer: [],
      notifications: [],
    });

    expect(migrated.schemaVersion).toBe('1.0');
  });

  it('fills missing page schemaVersion with current version', () => {
    const migrated = migratePageManifestEntry({
      title: 'Demo',
      permissions: [],
      components: [],
    });

    expect(migrated.schemaVersion).toBe('1.0');
  });

  it('throws for unsupported page schemaVersion', () => {
    expect(() =>
      migratePageManifestEntry({
        schemaVersion: '2.0',
        title: 'Demo',
        permissions: [],
        components: [],
      }),
    ).toThrowError(/Unsupported schemaVersion/);
  });
});
