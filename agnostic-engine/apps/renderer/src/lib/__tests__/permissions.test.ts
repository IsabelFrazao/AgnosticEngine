import { describe, expect, it } from 'vitest';
import { evaluatePermissionAccess } from '@agnostic/engine-core';

describe('evaluatePermissionAccess', () => {
  it('allows access when no permissions are required', () => {
    expect(evaluatePermissionAccess(undefined, [])).toEqual({
      allowed: true,
      missingPermissions: [],
    });
  });

  it('allows access when all required permissions are present', () => {
    expect(
      evaluatePermissionAccess(['courses:read', 'courses:write'], ['courses:write', 'courses:read']),
    ).toEqual({
      allowed: true,
      missingPermissions: [],
    });
  });

  it('denies access and returns missing permissions', () => {
    expect(
      evaluatePermissionAccess(['courses:read', 'courses:admin'], ['courses:read']),
    ).toEqual({
      allowed: false,
      missingPermissions: ['courses:admin'],
    });
  });
});
