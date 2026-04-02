import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/missions — List missions, optionally filtered by userId and status.
 * GET /api/missions/:id — Get a single mission by mission_id.
 * POST /api/missions — Create a new mission.
 * PATCH /api/missions/:id — Update a mission by mission_id.
 * Requirements: 5.1
 */

app.http('missions-by-id', {
  methods: ['GET', 'PATCH'],
  authLevel: 'anonymous',
  route: 'missions/{missionId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const missionId = req.params.missionId;
    if (!missionId) {
      return { status: 400, jsonBody: { error: 'missionId parameter is required' } };
    }

    if (req.method === 'GET') {
      return getMissionById(missionId, context);
    }
    return patchMission(missionId, req, context);
  },
});

app.http('missions', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'missions',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    if (req.method === 'POST') {
      return createMission(req, authResult.user, context);
    }
    return listMissions(req, context);
  },
});

async function listMissions(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const userId = req.query.get('userId');
    const status = req.query.get('status');

    let sql = 'SELECT * FROM missions';
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (userId) {
      conditions.push('user_id = @userId');
      params.userId = userId;
    }
    if (status && status !== 'all') {
      conditions.push('status = @status');
      params.status = status;
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return { status: 200, jsonBody: parseJsonColumns(result.recordset) };
  } catch (err: any) {
    context.error('missions GET error:', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch missions' } };
  }
}

async function getMissionById(missionId: string, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const result = await query(
      'SELECT * FROM missions WHERE mission_id = @missionId',
      { missionId }
    );
    if (result.recordset.length === 0) {
      return { status: 404, jsonBody: { error: 'Mission not found' } };
    }
    return { status: 200, jsonBody: parseJsonColumns(result.recordset)[0] };
  } catch (err: any) {
    context.error('missions GET by id error:', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch mission' } };
  }
}

async function createMission(req: HttpRequest, user: any, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as any;
    const {
      mission_id, callsign, mission_type, hems_base, helicopter, crew,
      origin, pickup, destination, patient_age, patient_gender,
      patient_weight_lbs, patient_details, medical_response, waypoints,
      tracking, live_data,
    } = body;

    if (!mission_id || !callsign || !mission_type) {
      return { status: 400, jsonBody: { error: 'mission_id, callsign, and mission_type are required' } };
    }

    const result = await query(
      `INSERT INTO missions (
        mission_id, user_id, callsign, mission_type, status,
        hems_base, helicopter, crew, origin, pickup, destination,
        patient_age, patient_gender, patient_weight_lbs, patient_details,
        medical_response, waypoints, tracking, live_data
      ) OUTPUT INSERTED.*
      VALUES (
        @mission_id, @user_id, @callsign, @mission_type, 'active',
        @hems_base, @helicopter, @crew, @origin, @pickup, @destination,
        @patient_age, @patient_gender, @patient_weight_lbs, @patient_details,
        @medical_response, @waypoints, @tracking, @live_data
      )`,
      {
        mission_id,
        user_id: user.id,
        callsign,
        mission_type,
        hems_base: jsonStr(hems_base),
        helicopter: jsonStr(helicopter),
        crew: jsonStr(crew),
        origin: jsonStr(origin),
        pickup: jsonStr(pickup),
        destination: jsonStr(destination),
        patient_age: patient_age ?? null,
        patient_gender: patient_gender ?? null,
        patient_weight_lbs: patient_weight_lbs ?? null,
        patient_details: patient_details ?? null,
        medical_response: medical_response ?? null,
        waypoints: jsonStr(waypoints),
        tracking: jsonStr(tracking),
        live_data: jsonStr(live_data),
      }
    );

    return { status: 201, jsonBody: parseJsonColumns(result.recordset)[0] };
  } catch (err: any) {
    context.error('missions POST error:', err);
    return { status: 500, jsonBody: { error: 'Failed to create mission' } };
  }
}

async function patchMission(missionId: string, req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as any;
    const setClauses: string[] = [];
    const params: Record<string, unknown> = { missionId };

    const allowedFields = [
      'status', 'pilot_notes', 'performance_score', 'flight_summary',
      'tracking', 'live_data', 'waypoints',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const isJson = ['flight_summary', 'tracking', 'live_data', 'waypoints'].includes(field);
        params[field] = isJson ? jsonStr(body[field]) : body[field];
        setClauses.push(`${field} = @${field}`);
      }
    }

    if (setClauses.length === 0) {
      return { status: 400, jsonBody: { error: 'No valid fields to update' } };
    }

    const result = await query(
      `UPDATE missions SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE mission_id = @missionId`,
      params
    );

    if (result.recordset.length === 0) {
      return { status: 404, jsonBody: { error: 'Mission not found' } };
    }
    return { status: 200, jsonBody: parseJsonColumns(result.recordset)[0] };
  } catch (err: any) {
    context.error('missions PATCH error:', err);
    return { status: 500, jsonBody: { error: 'Failed to update mission' } };
  }
}

/** Safely stringify objects for NVARCHAR(MAX) JSON columns. */
function jsonStr(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  return typeof val === 'string' ? val : JSON.stringify(val);
}

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
