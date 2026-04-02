import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/achievements/:userId — Get achievements for a user.
 * POST /api/achievements — Award a new achievement to the authenticated user.
 * Requirement 5.1
 */

app.http('achievements-by-user', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'achievements/{userId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const userId = req.params.userId;
    if (!userId) {
      return { status: 400, jsonBody: { error: 'userId parameter is required' } };
    }

    try {
      const result = await query(
        'SELECT * FROM achievements WHERE user_id = @userId',
        { userId }
      );
      return { status: 200, jsonBody: result.recordset };
    } catch (err: any) {
      context.error('achievements GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch achievements' } };
    }
  },
});

app.http('achievements', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'achievements',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as any;
      const { type } = body;

      if (!type) {
        return { status: 400, jsonBody: { error: 'type is required' } };
      }

      const result = await query(
        `INSERT INTO achievements (user_id, type) OUTPUT INSERTED.*
         VALUES (@userId, @type)`,
        { userId: authResult.user.id, type }
      );

      return { status: 201, jsonBody: result.recordset[0] };
    } catch (err: any) {
      context.error('achievements POST error:', err);
      return { status: 500, jsonBody: { error: 'Failed to create achievement' } };
    }
  },
});
