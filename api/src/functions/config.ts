import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { query } from '../lib/db.js';

/**
 * GET /api/config — List all config items (admin only).
 * PUT /api/config — Upsert a config item by key (admin only).
 * Requirements: 5.1, 5.3
 */
app.http('config', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'config',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const adminCheck = requireAdmin(authResult.user);
    if (adminCheck) return adminCheck;

    if (req.method === 'GET') {
      return getConfig(context);
    }
    return upsertConfig(req, context);
  },
});

async function getConfig(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const result = await query('SELECT * FROM config ORDER BY [key] ASC');
    return { status: 200, jsonBody: result.recordset };
  } catch (err: any) {
    context.error('config GET error:', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch config' } };
  }
}

async function upsertConfig(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as any;
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return { status: 400, jsonBody: { error: 'key and value are required' } };
    }

    const result = await query(
      `MERGE config AS target
       USING (SELECT @key AS [key]) AS source
       ON target.[key] = source.[key]
       WHEN MATCHED THEN
         UPDATE SET value = @value, description = @description, updated_at = GETUTCDATE()
       WHEN NOT MATCHED THEN
         INSERT ([key], value, description, updated_at)
         VALUES (@key, @value, @description, GETUTCDATE())
       OUTPUT INSERTED.*;`,
      { key, value, description: description ?? null }
    );

    return { status: 200, jsonBody: result.recordset[0] };
  } catch (err: any) {
    context.error('config PUT error:', err);
    return { status: 500, jsonBody: { error: 'Failed to upsert config' } };
  }
}
