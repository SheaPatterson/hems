import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/downloads — List all downloads ordered by category, title ascending.
 * POST /api/downloads — Create a new download entry.
 * DELETE /api/downloads/:id — Delete a download entry.
 * Requirement 5.1
 */

app.http('downloads-by-id', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'downloads/{downloadId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const downloadId = req.params.downloadId;
    if (!downloadId) {
      return { status: 400, jsonBody: { error: 'downloadId parameter is required' } };
    }

    try {
      await query('DELETE FROM downloads WHERE id = @downloadId', { downloadId });
      return { status: 200, jsonBody: { success: true } };
    } catch (err: any) {
      context.error('downloads DELETE error:', err);
      return { status: 500, jsonBody: { error: 'Failed to delete download' } };
    }
  },
});

app.http('downloads', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'downloads',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    if (req.method === 'POST') {
      return createDownload(req, context);
    }
    return listDownloads(context);
  },
});

async function listDownloads(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const result = await query(
      'SELECT * FROM downloads ORDER BY category ASC, title ASC'
    );
    return { status: 200, jsonBody: result.recordset };
  } catch (err: any) {
    context.error('downloads GET error:', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch downloads' } };
  }
}

async function createDownload(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as any;
    const { category, title, file_url, description } = body;

    if (!category || !title || !file_url) {
      return { status: 400, jsonBody: { error: 'category, title, and file_url are required' } };
    }

    const result = await query(
      `INSERT INTO downloads (category, title, file_url, description)
       OUTPUT INSERTED.*
       VALUES (@category, @title, @file_url, @description)`,
      { category, title, file_url, description: description ?? null }
    );

    return { status: 201, jsonBody: result.recordset[0] };
  } catch (err: any) {
    context.error('downloads POST error:', err);
    return { status: 500, jsonBody: { error: 'Failed to create download' } };
  }
}
