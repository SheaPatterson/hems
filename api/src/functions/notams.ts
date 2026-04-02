import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { query } from '../lib/db.js';

/**
 * GET /api/notams — List active NOTAMs ordered by created_at descending.
 * POST /api/notams — Create a new NOTAM (admin only).
 * PATCH /api/notams/:id — Update a NOTAM (e.g., deactivate).
 * Requirements: 5.1, 5.3
 */

app.http('notams-by-id', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'notams/{notamId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const notamId = req.params.notamId;
    if (!notamId) {
      return { status: 400, jsonBody: { error: 'notamId parameter is required' } };
    }

    try {
      const body = (await req.json()) as any;
      const setClauses: string[] = [];
      const params: Record<string, unknown> = { notamId };

      if (body.active !== undefined) {
        params.active = body.active ? 1 : 0;
        setClauses.push('active = @active');
      }
      if (body.title !== undefined) {
        params.title = body.title;
        setClauses.push('title = @title');
      }
      if (body.message !== undefined) {
        params.message = body.message;
        setClauses.push('message = @message');
      }
      if (body.severity !== undefined) {
        params.severity = body.severity;
        setClauses.push('severity = @severity');
      }

      if (setClauses.length === 0) {
        return { status: 400, jsonBody: { error: 'No valid fields to update' } };
      }

      const result = await query(
        `UPDATE notams SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE id = @notamId`,
        params
      );

      if (result.recordset.length === 0) {
        return { status: 404, jsonBody: { error: 'NOTAM not found' } };
      }
      return { status: 200, jsonBody: result.recordset[0] };
    } catch (err: any) {
      context.error('notams PATCH error:', err);
      return { status: 500, jsonBody: { error: 'Failed to update NOTAM' } };
    }
  },
});

app.http('notams', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'notams',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    if (req.method === 'POST') {
      const adminCheck = requireAdmin(authResult.user);
      if (adminCheck) return adminCheck;
      return createNotam(req, authResult.user, context);
    }
    return listNotams(context);
  },
});

async function listNotams(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const result = await query(
      'SELECT * FROM notams WHERE active = 1 ORDER BY created_at DESC'
    );
    return { status: 200, jsonBody: result.recordset };
  } catch (err: any) {
    context.error('notams GET error:', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch NOTAMs' } };
  }
}

async function createNotam(req: HttpRequest, user: any, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as any;
    const { title, message, severity } = body;

    if (!title || !message) {
      return { status: 400, jsonBody: { error: 'title and message are required' } };
    }

    const result = await query(
      `INSERT INTO notams (title, message, severity, user_id)
       OUTPUT INSERTED.*
       VALUES (@title, @message, @severity, @userId)`,
      { title, message, severity: severity || 'info', userId: user.id }
    );

    return { status: 201, jsonBody: result.recordset[0] };
  } catch (err: any) {
    context.error('notams POST error:', err);
    return { status: 500, jsonBody: { error: 'Failed to create NOTAM' } };
  }
}
