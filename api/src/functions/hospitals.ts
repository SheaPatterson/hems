import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/hospitals — List all hospitals ordered by name ascending.
 * Requirement 5.1
 */
app.http('hospitals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'hospitals',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const result = await query('SELECT * FROM hospitals ORDER BY name ASC');
      return { status: 200, jsonBody: result.recordset };
    } catch (err: any) {
      context.error('hospitals GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch hospitals' } };
    }
  },
});
