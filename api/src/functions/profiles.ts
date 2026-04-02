import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { query } from '../lib/db.js';

/**
 * GET /api/profiles — List all profiles ordered by last_name ascending.
 * PATCH /api/profiles/:id — Update a profile (admin only).
 * Requirements: 5.1, 5.3
 */

app.http('profiles-by-id', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'profiles/{profileId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const adminCheck = requireAdmin(authResult.user);
    if (adminCheck) return adminCheck;

    const profileId = req.params.profileId;
    if (!profileId) {
      return { status: 400, jsonBody: { error: 'profileId parameter is required' } };
    }

    try {
      const body = (await req.json()) as any;
      const setClauses: string[] = [];
      const params: Record<string, unknown> = { profileId };

      const allowedFields = [
        'first_name', 'last_name', 'avatar_url', 'location',
        'email_public', 'simulators', 'experience', 'bio', 'social_links',
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          params[field] = field === 'social_links' && typeof body[field] === 'object'
            ? JSON.stringify(body[field])
            : body[field];
          setClauses.push(`${field} = @${field}`);
        }
      }

      setClauses.push('updated_at = GETUTCDATE()');

      if (setClauses.length <= 1) {
        return { status: 400, jsonBody: { error: 'No valid fields to update' } };
      }

      const result = await query(
        `UPDATE profiles SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE id = @profileId`,
        params
      );

      if (result.recordset.length === 0) {
        return { status: 404, jsonBody: { error: 'Profile not found' } };
      }

      const row = result.recordset[0];
      if (typeof row.social_links === 'string') {
        try { row.social_links = JSON.parse(row.social_links); } catch { /* keep as string */ }
      }

      return { status: 200, jsonBody: row };
    } catch (err: any) {
      context.error('profiles PATCH error:', err);
      return { status: 500, jsonBody: { error: 'Failed to update profile' } };
    }
  },
});

app.http('profiles', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'profiles',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const result = await query('SELECT * FROM profiles ORDER BY last_name ASC');

      const rows = result.recordset.map((r: any) => {
        if (typeof r.social_links === 'string') {
          try { r.social_links = JSON.parse(r.social_links); } catch { /* keep */ }
        }
        return r;
      });

      return { status: 200, jsonBody: rows };
    } catch (err: any) {
      context.error('profiles GET error:', err);
      return { status: 500, jsonBody: { error: 'Failed to fetch profiles' } };
    }
  },
});
