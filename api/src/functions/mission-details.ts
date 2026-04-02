import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * POST /api/mission-details — Fetch full mission context by mission_id.
 * Requirements: 5.4
 */

app.http('mission-details', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'mission-details',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as any;
      const { mission_id } = body;

      if (!mission_id) {
        return { status: 400, jsonBody: { error: 'mission_id is required' } };
      }

      const result = await query(
        'SELECT * FROM missions WHERE mission_id = @missionId',
        { missionId: mission_id }
      );

      if (result.recordset.length === 0) {
        return { status: 404, jsonBody: { error: 'Mission not found' } };
      }

      const mission = parseJsonColumns(result.recordset)[0];

      return {
        status: 200,
        jsonBody: { mission },
      };
    } catch (err: any) {
      context.error('mission-details POST error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch mission details' } };
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
