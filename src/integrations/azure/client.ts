/**
 * Azure Client Abstraction Layer
 *
 * Drop-in replacement for the Supabase client. Provides a unified API surface
 * that all hooks consume, enabling incremental migration with feature flags.
 *
 * Sub-clients:
 *  - auth:      Wraps MSAL.js for Azure AD B2C authentication
 *  - db:        Placeholder — implemented by QueryBuilder task
 *  - realtime:  Placeholder — implemented by SignalRManager task
 *  - storage:   Azure Blob Storage CDN URL generation + upload
 *  - functions: Azure Functions invocation with auto-attached Bearer tokens
 */

import {
  PublicClientApplication,
  type Configuration,
  type AccountInfo,
  type SilentRequest,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { type AzureClientConfig } from './config';
import { QueryBuilder } from './queryBuilder';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AzureUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthResult {
  user: AzureUser;
  accessToken: string;
  idToken: string;
  expiresOn: Date;
}

export interface AzureAuthClient {
  getSession(): Promise<{ token: string; user: AzureUser } | null>;
  signIn(): Promise<AuthResult>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (user: AzureUser | null) => void): () => void;
  /** Expose the underlying MSAL instance for MsalProvider */
  getMsalInstance(): PublicClientApplication;
}

export interface AzureDatabaseClient {
  from(table: string): QueryBuilder;
}

export interface AzureRealtimeClient {
  subscribe(
    channel: string,
    table: string,
    filter: string | undefined,
    callback: (payload: unknown) => void,
  ): { unsubscribe: () => void };
  unsubscribe(subscription: { unsubscribe: () => void }): void;
}

export interface AzureStorageClient {
  getPublicUrl(container: string, blobPath: string): string;
  upload(container: string, blobPath: string, file: File): Promise<string>;
}

export interface AzureFunctionsClient {
  invoke(
    functionName: string,
    options: { method: string; body?: unknown },
  ): Promise<Response>;
}

export interface AzureClient {
  auth: AzureAuthClient;
  db: AzureDatabaseClient;
  realtime: AzureRealtimeClient;
  storage: AzureStorageClient;
  functions: AzureFunctionsClient;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapAccountToUser(account: AccountInfo): AzureUser {
  return {
    id: account.localAccountId,
    email: account.username,
    displayName: account.name ?? '',
    roles: (account.idTokenClaims?.['roles'] as string[] | undefined) ?? [],
  };
}

// ---------------------------------------------------------------------------
// Auth Client
// ---------------------------------------------------------------------------

function createAuthClient(
  msalInstance: PublicClientApplication,
  scopes: string[],
): AzureAuthClient {
  const listeners = new Set<(user: AzureUser | null) => void>();

  function activeAccount(): AccountInfo | null {
    return msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0] ?? null;
  }

  function notifyListeners(user: AzureUser | null) {
    listeners.forEach((cb) => cb(user));
  }

  const authClient: AzureAuthClient = {
    async getSession() {
      const account = activeAccount();
      if (!account) return null;

      const silentRequest: SilentRequest = { scopes, account };

      try {
        const result = await msalInstance.acquireTokenSilent(silentRequest);
        return {
          token: result.accessToken,
          user: mapAccountToUser(account),
        };
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          // Caller should trigger interactive login
          return null;
        }
        throw err;
      }
    },

    async signIn() {
      const result = await msalInstance.loginPopup({ scopes });
      if (result.account) {
        msalInstance.setActiveAccount(result.account);
      }

      const account = result.account!;
      const user = mapAccountToUser(account);
      notifyListeners(user);

      return {
        user,
        accessToken: result.accessToken,
        idToken: result.idToken,
        expiresOn: result.expiresOn ?? new Date(),
      };
    },

    async signOut() {
      await msalInstance.logoutPopup();
      notifyListeners(null);
    },

    onAuthStateChange(callback: (user: AzureUser | null) => void) {
      listeners.add(callback);

      // Fire immediately with current state
      const account = activeAccount();
      callback(account ? mapAccountToUser(account) : null);

      return () => {
        listeners.delete(callback);
      };
    },

    getMsalInstance() {
      return msalInstance;
    },
  };

  return authClient;
}

// ---------------------------------------------------------------------------
// Functions Client
// ---------------------------------------------------------------------------

function createFunctionsClient(
  apiBaseUrl: string,
  authClient: AzureAuthClient,
): AzureFunctionsClient {
  return {
    async invoke(functionName, options) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Auto-attach Bearer token from MSAL
      const session = await authClient.getSession();
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }

      const url = `${apiBaseUrl.replace(/\/+$/, '')}/api/${functionName}`;

      const fetchOptions: RequestInit = {
        method: options.method,
        headers,
      };

      if (options.body !== undefined && options.method !== 'GET') {
        fetchOptions.body = JSON.stringify(options.body);
      }

      return fetch(url, fetchOptions);
    },
  };
}

// ---------------------------------------------------------------------------
// Storage Client
// ---------------------------------------------------------------------------

function createStorageClient(storageBaseUrl: string): AzureStorageClient {
  const baseUrl = storageBaseUrl.replace(/\/+$/, '');

  return {
    getPublicUrl(container: string, blobPath: string): string {
      const cleanPath = blobPath.replace(/^\/+/, '');
      return `${baseUrl}/${container}/${cleanPath}`;
    },

    async upload(container: string, blobPath: string, file: File): Promise<string> {
      const url = `${baseUrl}/${container}/${blobPath.replace(/^\/+/, '')}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Storage upload failed: ${response.status} ${response.statusText}`);
      }

      return url;
    },
  };
}

// ---------------------------------------------------------------------------
// Database Client (QueryBuilder — translates Supabase-style queries to REST)
// ---------------------------------------------------------------------------

function createDatabaseClient(functionsClient: AzureFunctionsClient): AzureDatabaseClient {
  return {
    from(table: string): QueryBuilder {
      return new QueryBuilder(table, functionsClient);
    },
  };
}

// ---------------------------------------------------------------------------
// Realtime Client (stub — implemented in SignalRManager task)
// ---------------------------------------------------------------------------

function createRealtimeClient(): AzureRealtimeClient {
  return {
    subscribe(_channel, _table, _filter, _callback) {
      console.warn(
        'AzureRealtimeClient.subscribe() is a stub. The SignalRManager task will provide the full implementation.',
      );
      return { unsubscribe: () => {} };
    },
    unsubscribe(subscription) {
      subscription.unsubscribe();
    },
  };
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createAzureClient(config: AzureClientConfig): AzureClient {
  // Initialise MSAL
  const msalConfig: Configuration = {
    auth: {
      clientId: config.b2cConfig.clientId,
      authority: config.b2cConfig.authority,
      knownAuthorities: config.b2cConfig.knownAuthorities,
      redirectUri: config.b2cConfig.redirectUri,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  };

  const msalInstance = new PublicClientApplication(msalConfig);

  const auth = createAuthClient(msalInstance, config.b2cConfig.scopes);
  const functions = createFunctionsClient(config.apiBaseUrl, auth);
  const storage = createStorageClient(config.storageBaseUrl);
  const db = createDatabaseClient(functions);
  const realtime = createRealtimeClient();

  return { auth, db, realtime, storage, functions };
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

import { azureConfig } from './config';

export const azureClient: AzureClient = createAzureClient(azureConfig);
