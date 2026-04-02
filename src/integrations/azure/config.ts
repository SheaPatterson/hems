/**
 * Azure platform configuration.
 *
 * All values are read from VITE_-prefixed environment variables so that
 * Vite exposes them to the client bundle at build time.
 *
 * During the strangler-fig migration both Supabase and Azure backends
 * coexist — this config is consumed by the Azure client abstraction layer
 * while the existing Supabase client continues to work unchanged.
 */

export interface AzureB2CConfig {
  clientId: string;
  authority: string;
  knownAuthorities: string[];
  redirectUri: string;
  scopes: string[];
}

export interface AzureClientConfig {
  b2cConfig: AzureB2CConfig;
  apiBaseUrl: string;
  signalrEndpoint: string;
  storageBaseUrl: string;
}

function env(key: string): string {
  const value = import.meta.env[key] as string | undefined;
  return value ?? '';
}

export const azureB2CConfig: AzureB2CConfig = {
  clientId: env('VITE_AZURE_B2C_CLIENT_ID'),
  authority: env('VITE_AZURE_B2C_AUTHORITY'),
  knownAuthorities: [env('VITE_AZURE_B2C_KNOWN_AUTHORITY')],
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  scopes: [env('VITE_AZURE_API_SCOPE')],
};

export const azureConfig: AzureClientConfig = {
  b2cConfig: azureB2CConfig,
  apiBaseUrl: env('VITE_AZURE_API_BASE_URL'),
  signalrEndpoint: env('VITE_AZURE_SIGNALR_ENDPOINT'),
  storageBaseUrl: env('VITE_AZURE_STORAGE_URL'),
};
