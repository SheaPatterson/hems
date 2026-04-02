import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/hems-bases — List all HEMS bases with helicopter join, ordered by name ascending.
 * Matches the Supabase query: select(*, helicopters(registration))
 * Requirement 5.1
 */
app.http('hems-bases', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'hems-bases',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const result = await query(`
        SELECT
          b.*,
          h.registration AS helicopter_registration
        FROM hems_bases b
        LEFT JOIN helicopters h ON b.helicopter_id = h.id
        ORDER BY b.name ASC
      `);

      // Shape to match Supabase nested object: { ...base, helicopters: { registration } }
      const rows = result.recordset.map((r: any) => {
        const { helicopter_registration, ...base } = r;
        return {
          ...base,
          helicopters: helicopter_registration ? { registration: helicopter_registration } : null,
        };
      });

      return { status: 200, jsonBody: rows };
    } catch (err: any) {
      context.error('hems-bases GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch HEMS bases' } };
    }
  },
});
