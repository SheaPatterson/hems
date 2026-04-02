import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/helicopters — List all helicopters ordered by registration ascending.
 * Requirement 5.1
 */
app.http('helicopters', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'helicopters',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const result = await query('SELECT * FROM helicopters ORDER BY registration ASC');
      return { status: 200, jsonBody: result.recordset };
    } catch (err: any) {
      context.error('helicopters GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch helicopters' } };
    }
  },
});
