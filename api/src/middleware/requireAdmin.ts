import { HttpResponseInit } from '@azure/functions';
import { AuthenticatedUser } from './auth.js';

/**
 * Middleware that checks if the authenticated user has the 'admin' role.
 *
 * Requirement 5.3: Admin-only endpoints require the admin role claim.
 *
 * Usage:
 *   const authResult = await authenticate(req, context);
 *   if ('error' in authResult) return authResult.error;
 *   const adminCheck = requireAdmin(authResult.user);
 *   if (adminCheck) return adminCheck;
 *   // ... proceed with admin-only logic
 */
export function requireAdmin(user: AuthenticatedUser): HttpResponseInit | null {
  if (user.roles.includes('admin')) {
    return null; // authorized
  }

  return {
    status: 403,
    jsonBody: { error: 'Forbidden. Admin role required.' },
  };
}
