import { describe, expect, it } from 'vitest';
import { migrateLayout, migratePageManifestEntry } from '../migrations';

describe('metadata-schema/migrations', () => {
  it('fills missing layout schemaVersion', () => {
    const migrated = migrateLayout({
      sidebar: { extras: [] },
      navbar: [],
      footer: [],
      notifications: [],
    });
    expect(migrated.schemaVersion).toBe('1.0');
  });

  it('fills missing page schemaVersion', () => {
    const migrated = migratePageManifestEntry({
      title: 'Demo',
      permissions: [],
      components: [],
    });
    expect(migrated.schemaVersion).toBe('1.0');
  });

  it('throws for unsupported schemaVersion', () => {
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
