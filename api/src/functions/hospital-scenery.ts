import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * POST /api/hospital-scenery — Fetch hospital scenery data by hospital_id.
 * Requirements: 5.4
 */

app.http('hospital-scenery', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'hospital-scenery',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as any;
      const { hospital_id } = body;

      if (!hospital_id) {
        return { status: 400, jsonBody: { error: 'hospital_id is required' } };
      }

      const result = await query(
        'SELECT * FROM hospital_scenery WHERE hospital_id = @hospitalId',
        { hospitalId: hospital_id }
      );

      if (result.recordset.length === 0) {
        return { status: 404, jsonBody: { error: 'Hospital scenery not found' } };
      }

      const scenery = parseJsonColumns(result.recordset)[0];

      return {
        status: 200,
        jsonBody: { scenery },
      };
    } catch (err: any) {
      context.error('hospital-scenery POST error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch hospital scenery' } };
    }
  },
});

/** Parse image_urls JSON column back to an array for response. */
function parseJsonColumns(rows: any[]): any[] {
  const jsonFields = ['image_urls'];
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
