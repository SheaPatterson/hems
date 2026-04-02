import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/incident-reports — List all incident reports ordered by created_at descending.
 * POST /api/incident-reports — Create a new incident report.
 * PATCH /api/incident-reports/:id — Resolve an incident report.
 * Requirement 5.1
 */

app.http('incident-reports-by-id', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'incident-reports/{reportId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const reportId = req.params.reportId;
    if (!reportId) {
      return { status: 400, jsonBody: { error: 'reportId parameter is required' } };
    }

    try {
      const body = (await req.json()) as any;
      const { resolution } = body;

      if (!resolution) {
        return { status: 400, jsonBody: { error: 'resolution is required' } };
      }

      const result = await query(
        `UPDATE incident_reports
         SET status = 'Resolved', resolution = @resolution
         OUTPUT INSERTED.*
         WHERE id = @reportId`,
        { reportId, resolution }
      );

      if (result.recordset.length === 0) {
        return { status: 404, jsonBody: { error: 'Incident report not found' } };
      }
      return { status: 200, jsonBody: result.recordset[0] };
    } catch (err: any) {
      context.error('incident-reports PATCH error:', err);
      return { status: 500, jsonBody: { error: 'Failed to resolve incident report' } };
    }
  },
});

app.http('incident-reports', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'incident-reports',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    if (req.method === 'POST') {
      return createReport(req, context);
    }
    return listReports(context);
  },
});

async function listReports(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const result = await query('SELECT * FROM incident_reports ORDER BY created_at DESC');
    return { status: 200, jsonBody: result.recordset };
  } catch (err: any) {
    context.error('incident-reports GET error:', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch incident reports' } };
  }
}

async function createReport(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as any;
    const { mission_id, user_id, report_type, severity, description, actions_taken } = body;

    if (!mission_id || !user_id || !report_type || !severity || !description) {
      return { status: 400, jsonBody: { error: 'mission_id, user_id, report_type, severity, and description are required' } };
    }

    const result = await query(
      `INSERT INTO incident_reports (mission_id, user_id, report_type, severity, description, actions_taken)
       OUTPUT INSERTED.*
       VALUES (@mission_id, @user_id, @report_type, @severity, @description, @actions_taken)`,
      { mission_id, user_id, report_type, severity, description, actions_taken: actions_taken ?? null }
    );

    return { status: 201, jsonBody: result.recordset[0] };
  } catch (err: any) {
    context.error('incident-reports POST error:', err);
    return { status: 500, jsonBody: { error: 'Failed to create incident report' } };
  }
}
