/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Azure Platform
  readonly VITE_AZURE_B2C_CLIENT_ID: string;
  readonly VITE_AZURE_B2C_AUTHORITY: string;
  readonly VITE_AZURE_B2C_KNOWN_AUTHORITY: string;
  readonly VITE_AZURE_API_SCOPE: string;
  readonly VITE_AZURE_API_BASE_URL: string;
  readonly VITE_AZURE_SIGNALR_ENDPOINT: string;
  readonly VITE_AZURE_STORAGE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
