import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * POST /api/logs — Insert a log entry.
 * Requirement 5.1
 */
app.http('logs', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'logs',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as any;
      const { level, message } = body;

      if (!level || !message) {
        return { status: 400, jsonBody: { error: 'level and message are required' } };
      }

      await query(
        'INSERT INTO logs ([timestamp], level, message) VALUES (GETUTCDATE(), @level, @message)',
        { level, message }
      );

      return { status: 201, jsonBody: { success: true } };
    } catch (err: any) {
      context.error('logs POST error:', err);
      return { status: 500, jsonBody: { error: 'Failed to insert log' } };
    }
  },
});
