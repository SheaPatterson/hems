import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';
import { sendToGroup } from '../lib/signalr.js';

/**
 * GET /api/global-dispatch-logs — Fetch global dispatch logs, ordered by timestamp ASC, limit 50.
 * POST /api/global-dispatch-logs — Insert a new dispatch log entry, then broadcast via SignalR.
 * Requirement 5.6
 */

app.http('global-dispatch-logs', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'global-dispatch-logs',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    if (req.method === 'POST') {
      return createDispatchLog(req, authResult.user, context);
    }
    return listDispatchLogs(context);
  },
});

async function listDispatchLogs(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const result = await query(
      'SELECT TOP 50 * FROM global_dispatch_logs ORDER BY [timestamp] ASC'
    );
    return { status: 200, jsonBody: result.recordset };
  } catch (err: any) {
    context.error('global-dispatch-logs GET error:', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch dispatch logs' } };
  }
}

async function createDispatchLog(
  req: HttpRequest,
  user: { id: string },
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as any;
    const { sender, message, callsign } = body;

    if (!sender || !message) {
      return { status: 400, jsonBody: { error: 'sender and message are required' } };
    }

    const result = await query(
      `INSERT INTO global_dispatch_logs (sender, message, callsign, user_id)
       OUTPUT INSERTED.*
       VALUES (@sender, @message, @callsign, @user_id)`,
      { sender, message, callsign: callsign ?? null, user_id: user.id }
    );

    const inserted = result.recordset[0];

    // Broadcast to the global-dispatch SignalR group
    try {
      await sendToGroup('global-dispatch', 'newDispatchLog', inserted);
    } catch (signalrErr: any) {
      context.warn('SignalR broadcast failed for global-dispatch:', signalrErr.message);
      // Don't fail the request if SignalR broadcast fails
    }

    return { status: 201, jsonBody: inserted };
  } catch (err: any) {
    context.error('global-dispatch-logs POST error:', err);
    return { status: 500, jsonBody: { error: 'Failed to insert dispatch log' } };
  }
}
