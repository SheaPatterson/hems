import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import * as crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';

/**
 * POST /api/negotiate — SignalR negotiate endpoint.
 *
 * Returns a SignalR connection URL and access token scoped to the
 * authenticated user. The frontend SignalR client calls this to
 * establish a WebSocket connection to Azure SignalR Service.
 *
 * Requirement 6.2: A SignalR negotiate Azure Function endpoint returns
 * connection info scoped to the authenticated user.
 */
app.http('negotiate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'negotiate',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    const connectionString = process.env.AZURE_SIGNALR_CONNECTION_STRING;
    if (!connectionString) {
      context.error('AZURE_SIGNALR_CONNECTION_STRING is not configured');
      return {
        status: 500,
        jsonBody: { error: 'SignalR service is not configured' },
      };
    }

    try {
      const { endpoint, accessKey } = parseConnectionString(connectionString);
      const hub = 'default';
      const userId = authResult.user.id;

      const clientUrl = `${endpoint}/client/?hub=${hub}`;
      const serverUrl = `${endpoint}/client/?hub=${hub}`;
      const accessToken = generateAccessToken(serverUrl, accessKey, userId);

      return {
        status: 200,
        jsonBody: { url: clientUrl, accessToken },
      };
    } catch (err: any) {
      context.error('negotiate error:', err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to generate SignalR connection info' },
      };
    }
  },
});

interface ParsedConnectionString {
  endpoint: string;
  accessKey: string;
}

function parseConnectionString(connectionString: string): ParsedConnectionString {
  const endpointMatch = connectionString.match(/Endpoint=([^;]+)/i);
  const keyMatch = connectionString.match(/AccessKey=([^;]+)/i);

  if (!endpointMatch || !keyMatch) {
    throw new Error('Invalid SignalR connection string: missing Endpoint or AccessKey');
  }

  const endpoint = endpointMatch[1].replace(/\/$/, '');
  return { endpoint, accessKey: keyMatch[1] };
}

/**
 * Generate a JWT access token for the SignalR client connection,
 * scoped to a specific user ID.
 */
function generateAccessToken(
  url: string,
  accessKey: string,
  userId: string,
  expiresInMinutes: number = 60
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInMinutes * 60;

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: Record<string, unknown> = {
    aud: url,
    iat: now,
    exp,
    nbf: now,
    sub: userId,
    'nameid': userId,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const headerEncoded = encode(header);
  const payloadEncoded = encode(payload);
  const signature = crypto
    .createHmac('sha256', accessKey)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest('base64url');

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}
