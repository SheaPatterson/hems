import * as crypto from 'crypto';

/**
 * Azure SignalR Service REST API helper.
 *
 * Sends messages to SignalR groups using the REST API,
 * authenticated via the connection string from environment variables.
 *
 * Requirement 5.6: Mission radio log and global dispatch log POST endpoints
 * broadcast the new entry via Azure SignalR after database insertion.
 */

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

  // Remove trailing slash from endpoint
  const endpoint = endpointMatch[1].replace(/\/$/, '');
  return { endpoint, accessKey: keyMatch[1] };
}

/**
 * Generate a JWT access token for the SignalR REST API.
 */
function generateAccessToken(
  endpoint: string,
  accessKey: string,
  url: string,
  expiresInMinutes: number = 5
): string {
  const audience = url;
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInMinutes * 60;

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { aud: audience, iat: now, exp, nbf: now };

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

/**
 * Send a message to a SignalR group via the Azure SignalR Service REST API.
 *
 * @param group  - The group name (e.g. 'mission-radio:abc123', 'global-dispatch')
 * @param event  - The event/target name clients listen for
 * @param data   - The payload to broadcast
 * @param hub    - The hub name (defaults to 'default')
 */
export async function sendToGroup(
  group: string,
  event: string,
  data: unknown,
  hub: string = 'default'
): Promise<void> {
  const connectionString = process.env.AZURE_SIGNALR_CONNECTION_STRING;
  if (!connectionString) {
    // Silently skip if SignalR is not configured (e.g. local dev without SignalR)
    console.warn('AZURE_SIGNALR_CONNECTION_STRING not set — skipping SignalR broadcast');
    return;
  }

  const { endpoint, accessKey } = parseConnectionString(connectionString);
  const url = `${endpoint}/api/v1/hubs/${hub}/groups/${encodeURIComponent(group)}`;
  const token = generateAccessToken(endpoint, accessKey, url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      target: event,
      arguments: [data],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`SignalR broadcast failed (${response.status}): ${body}`);
  }
}
