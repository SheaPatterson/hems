import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';
import { sendToGroup } from '../lib/signalr.js';

/**
 * GET /api/mission-logs/:missionId — Fetch radio logs for a mission, ordered by timestamp ASC.
 * POST /api/mission-logs — Insert a new radio log entry, then broadcast via SignalR.
 * Requirement 5.6
 */

app.http('mission-logs-by-mission', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'mission-logs/{missionId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const missionId = req.params.missionId;
    if (!missionId) {
      return { status: 400, jsonBody: { error: 'missionId parameter is required' } };
    }

    try {
      const result = await query(
        'SELECT * FROM mission_radio_logs WHERE mission_id = @missionId ORDER BY [timestamp] ASC',
        { missionId }
      );
      return { status: 200, jsonBody: result.recordset };
    } catch (err: any) {
      context.error('mission-logs GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch mission logs' } };
    }
  },
});

app.http('mission-logs', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'mission-logs',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as any;
      const { sender, message, callsign, mission_id } = body;

      if (!sender || !message || !mission_id) {
        return {
          status: 400,
          jsonBody: { error: 'sender, message, and mission_id are required' },
        };
      }

      const user_id = authResult.user.id;

      const result = await query(
        `INSERT INTO mission_radio_logs (mission_id, sender, message, callsign, user_id)
         OUTPUT INSERTED.*
         VALUES (@mission_id, @sender, @message, @callsign, @user_id)`,
        { mission_id, sender, message, callsign: callsign ?? null, user_id }
      );

      const inserted = result.recordset[0];

      // Broadcast to the mission-specific SignalR group
      try {
        await sendToGroup(
          `mission-radio:${mission_id}`,
          'newRadioLog',
          inserted
        );
      } catch (signalrErr: any) {
        context.warn('SignalR broadcast failed for mission-radio:', signalrErr.message);
        // Don't fail the request if SignalR broadcast fails
      }

      return { status: 201, jsonBody: inserted };
    } catch (err: any) {
      context.error('mission-logs POST error:', err);
      return { status: 500, jsonBody: { error: 'Failed to insert mission log' } };
    }
  },
});
