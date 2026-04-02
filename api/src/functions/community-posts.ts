import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';

/**
 * GET /api/community-posts — List all posts ordered by created_at descending.
 * POST /api/community-posts — Create a new post.
 * DELETE /api/community-posts/:id — Delete a post by id.
 * Requirement 5.1
 */

app.http('community-posts-by-id', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'community-posts/{postId}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const postId = req.params.postId;
    if (!postId) {
      return { status: 400, jsonBody: { error: 'postId parameter is required' } };
    }

    try {
      await query('DELETE FROM community_posts WHERE id = @postId', { postId });
      return { status: 200, jsonBody: { success: true } };
    } catch (err: any) {
      context.error('community-posts DELETE error:', err);
      return { status: 500, jsonBody: { error: 'Failed to delete post' } };
    }
  },
});

app.http('community-posts', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'community-posts',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    if (req.method === 'POST') {
      return createPost(req, context);
    }
    return listPosts(context);
  },
});

async function listPosts(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const result = await query('SELECT * FROM community_posts ORDER BY created_at DESC');
    return { status: 200, jsonBody: result.recordset };
  } catch (err: any) {
    context.error('community-posts GET error:', err);
    return { status: 500, jsonBody: { error: 'Failed to fetch posts' } };
  }
}

async function createPost(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as any;
    const { title, content, user_id } = body;

    if (!title || !content || !user_id) {
      return { status: 400, jsonBody: { error: 'title, content, and user_id are required' } };
    }

    const result = await query(
      `INSERT INTO community_posts (user_id, title, content)
       OUTPUT INSERTED.*
       VALUES (@user_id, @title, @content)`,
      { user_id, title, content }
    );

    return { status: 201, jsonBody: result.recordset[0] };
  } catch (err: any) {
    context.error('community-posts POST error:', err);
    return { status: 500, jsonBody: { error: 'Failed to create post' } };
  }
}
