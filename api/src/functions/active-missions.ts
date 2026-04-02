import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/active-missions — Fetch active missions for simulator client.
 * Supports both Bearer token and API key auth.
 * Requirements: 5.4
 */

app.http('active-missions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'active-missions',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const result = await query(
        "SELECT * FROM missions WHERE status = 'active' ORDER BY created_at DESC"
      );

      return {
        status: 200,
        jsonBody: { missions: parseJsonColumns(result.recordset) },
      };
    } catch (err: any) {
      context.error('active-missions GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch active missions' } };
    }
  },
});

/** Parse JSON string columns back to objects for response. */
function parseJsonColumns(rows: any[]): any[] {
  const jsonFields = [
    'hems_base', 'helicopter', 'crew', 'origin', 'pickup', 'destination',
    'waypoints', 'tracking', 'live_data', 'flight_summary',
  ];
  return rows.map((row) => {
    const parsed = { ...row };
    for (const field of jsonFields) {
      if (typeof parsed[field] === 'string') {
        try { parsed[field] = JSON.parse(parsed[field]); } catch { /* keep as string */ }
      }
    }
    return parsed;
  });
}
