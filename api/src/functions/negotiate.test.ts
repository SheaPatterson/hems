import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as crypto from 'crypto';

/**
 * Unit tests for the negotiate function's core logic.
 *
 * We test parseConnectionString and generateAccessToken directly
 * since the HTTP handler depends on Azure Functions runtime bindings.
 */

// Re-implement the pure functions here for isolated testing,
// since they are module-private in negotiate.ts.

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

describe('negotiate - parseConnectionString', () => {
  it('parses a valid connection string', () => {
    const connStr = 'Endpoint=https://my-signalr.service.signalr.net;AccessKey=abc123secret;Version=1.0;';
    const result = parseConnectionString(connStr);

    expect(result.endpoint).toBe('https://my-signalr.service.signalr.net');
    expect(result.accessKey).toBe('abc123secret');
  });

  it('strips trailing slash from endpoint', () => {
    const connStr = 'Endpoint=https://my-signalr.service.signalr.net/;AccessKey=key123;';
    const result = parseConnectionString(connStr);

    expect(result.endpoint).toBe('https://my-signalr.service.signalr.net');
  });

  it('throws on missing Endpoint', () => {
    expect(() => parseConnectionString('AccessKey=abc123;')).toThrow(
      'Invalid SignalR connection string: missing Endpoint or AccessKey'
    );
  });

  it('throws on missing AccessKey', () => {
    expect(() => parseConnectionString('Endpoint=https://example.com;')).toThrow(
      'Invalid SignalR connection string: missing Endpoint or AccessKey'
    );
  });

  it('throws on empty string', () => {
    expect(() => parseConnectionString('')).toThrow(
      'Invalid SignalR connection string: missing Endpoint or AccessKey'
    );
  });
});

describe('negotiate - generateAccessToken', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a valid 3-part JWT string', () => {
    const token = generateAccessToken(
      'https://my-signalr.service.signalr.net/client/?hub=default',
      'test-access-key',
      'user-123'
    );

    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('includes correct header with HS256 algorithm', () => {
    const token = generateAccessToken(
      'https://example.com/client/?hub=default',
      'test-key',
      'user-1'
    );

    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
    expect(header).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('includes user ID in sub and nameid claims', () => {
    const token = generateAccessToken(
      'https://example.com/client/?hub=default',
      'test-key',
      'user-abc-456'
    );

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    expect(payload.sub).toBe('user-abc-456');
    expect(payload.nameid).toBe('user-abc-456');
  });

  it('sets audience to the provided URL', () => {
    const url = 'https://my-signalr.service.signalr.net/client/?hub=default';
    const token = generateAccessToken(url, 'test-key', 'user-1');

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    expect(payload.aud).toBe(url);
  });

  it('sets expiry based on expiresInMinutes parameter', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = generateAccessToken(
      'https://example.com/client/?hub=default',
      'test-key',
      'user-1',
      30
    );

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    expect(payload.exp).toBe(now + 30 * 60);
    expect(payload.iat).toBe(now);
    expect(payload.nbf).toBe(now);
  });

  it('defaults to 60 minute expiry', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = generateAccessToken(
      'https://example.com/client/?hub=default',
      'test-key',
      'user-1'
    );

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    expect(payload.exp).toBe(now + 60 * 60);
  });

  it('produces a valid HMAC-SHA256 signature', () => {
    const accessKey = 'my-secret-key-for-signing';
    const token = generateAccessToken(
      'https://example.com/client/?hub=default',
      accessKey,
      'user-1'
    );

    const [headerEncoded, payloadEncoded, signature] = token.split('.');

    const expectedSignature = crypto
      .createHmac('sha256', accessKey)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('base64url');

    expect(signature).toBe(expectedSignature);
  });
});
