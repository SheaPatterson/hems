import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import {
  getTelemetryContainer,
  getTelemetrySummaryContainer,
  getLivePilotStatusContainer,
} from '../lib/cosmos.js';
import { sendToGroup } from '../lib/signalr.js';

/**
 * POST /api/update-telemetry — Validate request, upsert telemetry to Cosmos DB,
 *   upsert summary + live pilot status, broadcast via SignalR.
 * GET  /api/telemetry-summary — Read all telemetry summaries from Cosmos DB.
 *
 * Supports Bearer token AND API key auth (bridge uses API key).
 * Requirements: 5.4, 5.5, 4.5
 */

interface TelemetryPayload {
  mission_id: string;
  timeEnrouteMinutes?: number;
  fuelRemainingLbs: number;
  latitude: number;
  longitude: number;
  altitudeFt?: number;
  groundSpeedKts?: number;
  headingDeg?: number;
  verticalSpeedFtMin?: number;
  phase?: string;
  engineStatus?: string;
}

// ── POST /api/update-telemetry ──────────────────────────────────────────────

app.http('update-telemetry', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'update-telemetry',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    // Authenticate via Bearer token OR API key
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as TelemetryPayload;

      // Validate required fields
      const { mission_id, latitude, longitude, fuelRemainingLbs } = body;
      if (!mission_id || latitude == null || longitude == null || fuelRemainingLbs == null) {
        return {
          status: 400,
          jsonBody: { error: 'mission_id, latitude, longitude, and fuelRemainingLbs are required' },
        };
      }

      const now = Date.now();
      const userId = authResult.user.id;

      // 1. Create telemetry document in Cosmos DB telemetry container
      const telemetryContainer = getTelemetryContainer();
      const telemetryDoc = {
        id: `${mission_id}-${now}`,
        mission_id,
        user_id: userId,
        latitude,
        longitude,
        altitude_ft: body.altitudeFt ?? 0,
        ground_speed_kts: body.groundSpeedKts ?? 0,
        heading_deg: body.headingDeg ?? 0,
        vertical_speed_ft_min: body.verticalSpeedFtMin ?? 0,
        fuel_remaining_lbs: fuelRemainingLbs,
        phase: body.phase ?? 'Unknown',
        engine_status: body.engineStatus ?? 'Running',
        timestamp: now,
      };

      await telemetryContainer.items.create(telemetryDoc);

      // 2. Upsert telemetry summary (one doc per mission)
      const summaryContainer = getTelemetrySummaryContainer();
      const summaryDoc = {
        id: mission_id,
        mission_id,
        latitude,
        longitude,
        phase: body.phase ?? 'Unknown',
        fuel_remaining_lbs: fuelRemainingLbs,
        last_update: now,
      };

      await summaryContainer.items.upsert(summaryDoc);

      // 3. Upsert live pilot status (one doc per user, TTL auto-expires)
      const pilotContainer = getLivePilotStatusContainer();
      const pilotDoc = {
        id: userId,
        user_id: userId,
        callsign: '',
        latitude,
        longitude,
        altitude_ft: body.altitudeFt ?? 0,
        ground_speed_kts: body.groundSpeedKts ?? 0,
        heading_deg: body.headingDeg ?? 0,
        fuel_remaining_lbs: fuelRemainingLbs,
        phase: body.phase ?? 'Unknown',
        last_seen: new Date().toISOString(),
      };

      await pilotContainer.items.upsert(pilotDoc);

      // 4. Broadcast via SignalR to telemetry:{missionId} and pilot-positions
      const positionUpdate = {
        mission_id,
        user_id: userId,
        latitude,
        longitude,
        altitude_ft: body.altitudeFt ?? 0,
        ground_speed_kts: body.groundSpeedKts ?? 0,
        heading_deg: body.headingDeg ?? 0,
        fuel_remaining_lbs: fuelRemainingLbs,
        phase: body.phase ?? 'Unknown',
        timestamp: now,
      };

      try {
        await Promise.all([
          sendToGroup(`telemetry:${mission_id}`, 'telemetryUpdate', positionUpdate),
          sendToGroup('pilot-positions', 'positionUpdate', positionUpdate),
        ]);
      } catch (signalrErr: any) {
        context.warn('SignalR broadcast failed for telemetry:', signalrErr.message);
        // Don't fail the request if SignalR broadcast fails
      }

      return { status: 200, jsonBody: { success: true } };
    } catch (err: any) {
      context.error('update-telemetry POST error:', err);
      return { status: 500, jsonBody: { error: 'Failed to update telemetry' } };
    }
  },
});

// ── GET /api/telemetry-summary ──────────────────────────────────────────────

app.http('telemetry-summary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'telemetry-summary',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const container = getTelemetrySummaryContainer();
      const { resources } = await container.items
        .query('SELECT * FROM c')
        .fetchAll();

      return { status: 200, jsonBody: resources };
    } catch (err: any) {
      context.error('telemetry-summary GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch telemetry summary' } };
    }
  },
});
