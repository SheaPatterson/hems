import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/user-roles/:userId — Get roles for a specific user.
 * Returns array of role_id strings matching the useUserRole hook shape.
 * Requirement 5.1
 */
app.http('user-roles', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'user-roles/{userId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const userId = req.params.userId;
    if (!userId) {
      return { status: 400, jsonBody: { error: 'userId parameter is required' } };
    }

    try {
      const result = await query(
        'SELECT role_id FROM user_roles WHERE user_id = @userId',
        { userId }
      );
      return { status: 200, jsonBody: result.recordset };
    } catch (err: any) {
      context.error('user-roles GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch user roles' } };
    }
  },
});
