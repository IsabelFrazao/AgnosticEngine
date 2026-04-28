export type PermissionAccessResult = {
  allowed: boolean;
  missingPermissions: string[];
};

function normalizePermissions(permissions?: string[]): string[] {
  if (!permissions?.length) {
    return [];
  }

  return [...new Set(permissions.filter(Boolean))];
}

export function evaluatePermissionAccess(
  requiredPermissions?: string[],
  currentUserPermissions?: string[],
): PermissionAccessResult {
  const required = normalizePermissions(requiredPermissions);

  if (!required.length) {
    return { allowed: true, missingPermissions: [] };
  }

  const granted = new Set(normalizePermissions(currentUserPermissions));
  const missingPermissions = required.filter((permission) => !granted.has(permission));

  return {
    allowed: missingPermissions.length === 0,
    missingPermissions,
  };
}
