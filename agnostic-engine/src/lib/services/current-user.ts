import { MOCK_CURRENT_USER_PERMISSIONS } from '@/src/data/mock-auth';

/**
 * Effective permissions for the current session.
 * Demo implementation — replace with session/API-derived permissions.
 */
export function getCurrentUserPermissions(): readonly string[] {
  return MOCK_CURRENT_USER_PERMISSIONS;
}
