import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { getLivePilotStatusContainer } from '../lib/cosmos.js';

/**
 * GET /api/live-pilots — Fetch live pilot positions from Cosmos DB.
 * Cosmos DB TTL auto-expires stale entries (15 min), so we return all documents.
 * Matches the useLivePilots hook shape.
 * Requirement 5.1
 */
app.http('live-pilots', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'live-pilots',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const container = getLivePilotStatusContainer();
      const { resources } = await container.items
        .query('SELECT * FROM c')
        .fetchAll();

      // Map Cosmos documents to the LivePilot shape expected by the frontend
      const pilots = resources.map((doc: any) => ({
        user_id: doc.user_id,
        last_seen: doc.last_seen,
        latitude: doc.latitude,
        longitude: doc.longitude,
        altitude_ft: doc.altitude_ft,
        ground_speed_kts: doc.ground_speed_kts,
        heading_deg: doc.heading_deg,
        fuel_remaining_lbs: doc.fuel_remaining_lbs,
        phase: doc.phase,
        callsign: doc.callsign,
      }));

      return { status: 200, jsonBody: pilots };
    } catch (err: any) {
      context.error('live-pilots GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch live pilots' } };
    }
  },
});
