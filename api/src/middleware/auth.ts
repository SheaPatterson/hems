import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

/**
 * Authenticated user identity extracted from JWT or API key auth.
 */
export interface AuthenticatedUser {
  id: string;       // B2C oid claim
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

const tenantName = process.env.AZURE_B2C_TENANT_NAME || '';
const policyName = process.env.AZURE_B2C_POLICY_NAME || 'B2C_1_signupsignin';
const clientId = process.env.AZURE_B2C_CLIENT_ID || '';

const jwksUri = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policyName}/discovery/v2.0/keys`;
const issuer = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policyName}/v2.0/`;

const client = jwksClient({
  jwksUri,
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
});

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      const signingKey = key?.getPublicKey();
      if (!signingKey) return reject(new Error('No signing key found'));
      resolve(signingKey);
    });
  });
}

/**
 * Validate a Bearer JWT token from Azure AD B2C.
 * Returns the decoded user or null if invalid.
 */
async function validateJwt(token: string): Promise<AuthenticatedUser | null> {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header) return null;

    const signingKey = await getSigningKey(decoded.header);

    const payload = jwt.verify(token, signingKey, {
      audience: clientId,
      issuer,
      algorithms: ['RS256'],
    }) as jwt.JwtPayload;

    return {
      id: payload.oid || payload.sub || '',
      email: payload.emails?.[0] || payload.email || '',
      displayName: payload.name || payload.given_name || '',
      roles: payload.extension_Roles
        ? (Array.isArray(payload.extension_Roles) ? payload.extension_Roles : [payload.extension_Roles])
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * Validate an API key from the x-api-key header.
 * Used by bridge/simulator endpoints as an alternative to Bearer tokens.
 */
function validateApiKey(apiKey: string): boolean {
  const validKeys = (process.env.API_KEYS || '').split(',').filter(Boolean);
  return validKeys.includes(apiKey);
}

/**
 * Authentication middleware for Azure Functions.
 *
 * Checks for:
 * 1. Bearer token (Azure AD B2C JWT) in Authorization header
 * 2. API key in x-api-key header (for bridge/simulator endpoints)
 *
 * Returns 401 if neither is valid.
 *
 * Requirement 5.2: All endpoints validate JWT tokens from Azure AD B2C
 * Requirement 5.5: API key authentication for bridge/simulator endpoints
 */
export async function authenticate(
  req: HttpRequest,
  context: InvocationContext
): Promise<{ user: AuthenticatedUser } | { error: HttpResponseInit }> {
  // Try Bearer token first
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const user = await validateJwt(token);
    if (user) {
      context.log(`Authenticated user ${user.id} via JWT`);
      return { user };
    }
    return {
      error: {
        status: 401,
        jsonBody: { error: 'Invalid or expired token' },
      },
    };
  }

  // Try API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    if (validateApiKey(apiKey)) {
      context.log('Authenticated via API key');
      return {
        user: {
          id: 'api-key-user',
          email: '',
          displayName: 'API Key Client',
          roles: ['bridge'],
        },
      };
    }
    return {
      error: {
        status: 401,
        jsonBody: { error: 'Invalid API key' },
      },
    };
  }

  return {
    error: {
      status: 401,
      jsonBody: { error: 'Missing authentication. Provide a Bearer token or x-api-key header.' },
    },
  };
}
