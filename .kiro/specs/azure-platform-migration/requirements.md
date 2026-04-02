# Requirements: Azure Platform Migration

## Requirement 1: Azure Client Abstraction Layer
### User Story
As a developer, I want a unified Azure client abstraction that mirrors the Supabase client API surface, so that all existing hooks can be migrated incrementally without modifying consuming components.

### Acceptance Criteria
- [ ] An `AzureClient` interface is implemented at `src/integrations/azure/client.ts` exposing `auth`, `db`, `realtime`, `storage`, and `functions` sub-clients
- [ ] The `AzureFunctionsClient.invoke()` method attaches Bearer tokens from MSAL automatically and routes requests through the Azure API Management base URL
- [ ] The `AzureStorageClient.getPublicUrl()` method generates Azure Blob Storage CDN URLs for any container/blob path combination
- [ ] All Azure configuration (API base URL, B2C config, SignalR endpoint, storage URL) is read from `VITE_`-prefixed environment variables, not hardcoded
- [ ] A feature-flag utility `migrateHookToAzure()` is implemented that accepts both Supabase and Azure hook implementations and switches between them based on a `'supabase' | 'azure' | 'shadow'` flag value

## Requirement 2: Azure AD B2C Authentication
### User Story
As a user, I want to sign in with my email and password via Azure AD B2C so that my identity and session are managed by Azure instead of Supabase Auth.

### Acceptance Criteria
- [ ] An `AzureAuthProvider` React context component wraps the app using `@azure/msal-react`, replacing the existing Supabase `AuthProvider`
- [ ] The `useAuth()` hook returns `{ user, isLoading, signIn, signOut }` with the same interface shape as the current Supabase-based `useAuth`
- [ ] `signIn()` triggers an MSAL popup login flow against the configured B2C sign-up/sign-in user flow
- [ ] Silent token renewal via `acquireTokenSilent()` is handled automatically; on `InteractionRequiredAuthError`, the user is prompted to re-authenticate
- [ ] The `AzureUser` object includes `id` (B2C oid claim), `email`, `displayName`, and `roles` (fetched from the `user_roles` table via API)
- [ ] The existing `AuthGuard` and `AdminGuard` route protection components work with the new auth provider without interface changes
- [ ] All hardcoded Supabase auth URLs and the `@supabase/auth-ui-react` login form are replaced with MSAL-based equivalents

## Requirement 3: Azure SQL Database Migration
### User Story
As a system, I need all relational data currently in Supabase PostgreSQL migrated to Azure SQL Database so that the application's CRUD operations continue to function identically.

### Acceptance Criteria
- [ ] All existing Supabase tables are recreated in Azure SQL with equivalent schemas: `hospitals`, `helicopters`, `hems_bases`, `missions`, `profiles`, `user_roles`, `achievements`, `community_posts`, `incident_reports`, `notams`, `downloads`, `config`, `logs`, `mission_radio_logs`, `global_dispatch_logs`, `content_pages`, `base_scenery`, `hospital_scenery`
- [ ] Snake_case column naming is preserved so existing frontend mapping functions (e.g., `mapDbToHospital`) require no changes
- [ ] JSONB columns (e.g., `hems_base`, `helicopter`, `crew`, `tracking`, `waypoints` on `missions`) are stored as `NVARCHAR(MAX)` with JSON content
- [ ] UUID primary keys use `NEWID()` default or application-generated `crypto.randomUUID()`
- [ ] Indexes are created on `user_id`, `mission_id`, and `status` columns across relevant tables
- [ ] A data migration script exports all rows from Supabase PostgreSQL and imports them into Azure SQL with zero data loss

## Requirement 4: Cosmos DB for High-Frequency Data
### User Story
As a pilot using the live tracking system, I want my telemetry data written to a low-latency store so that position updates appear on the dashboard within 500ms.

### Acceptance Criteria
- [ ] A Cosmos DB `telemetry` container is provisioned with partition key `/mission_id` and TTL of 86400 seconds (24 hours)
- [ ] A Cosmos DB `live_pilot_status` container is provisioned with partition key `/user_id` and TTL of 900 seconds (15 minutes), auto-expiring stale pilot entries
- [ ] A Cosmos DB `telemetry_summary` container stores one document per active mission, upserted on each telemetry write
- [ ] Autoscale is configured at 400–4000 RU/s on the telemetry container to handle burst writes
- [ ] The telemetry pipeline sustains ≥1 update/second per active mission with p99 latency ≤500ms end-to-end

## Requirement 5: Azure Functions API Layer
### User Story
As a frontend developer, I want all database operations routed through Azure Functions REST endpoints so that authorization is enforced server-side and the frontend no longer makes direct database calls.

### Acceptance Criteria
- [ ] Azure Functions (Node.js 20 runtime) are deployed with REST endpoints for all CRUD operations currently performed by Supabase client queries (hospitals, helicopters, hems_bases, missions, profiles, config, achievements, community_posts, incident_reports, notams, downloads, user_roles, logs)
- [ ] All endpoints validate JWT tokens from Azure AD B2C and extract user identity from token claims
- [ ] Admin-only endpoints (config upsert, profile updates by admin, NOTAM creation) require the `admin` role claim
- [ ] The existing Supabase Edge Functions are re-implemented: `tactical-analyst`, `dispatch-agent`, `generate-tts-audio`, `fetch-active-missions`, `get-mission-details`, `fetch-hospital-scenery`, `update-telemetry`
- [ ] API key authentication is supported for bridge/simulator endpoints (`update-telemetry`, `active-missions`, `chat-relay`) as an alternative to Bearer tokens
- [ ] Mission radio log and global dispatch log POST endpoints broadcast the new entry via Azure SignalR after database insertion
- [ ] Azure Functions Premium plan (EP1) is used for latency-critical endpoints (`dispatch-agent`, `update-telemetry`) to eliminate cold starts

## Requirement 6: Azure SignalR Realtime Service
### User Story
As a dispatcher, I want to receive live radio messages and pilot position updates in real time so that the operational dashboard stays current without manual refresh.

### Acceptance Criteria
- [ ] A `SignalRManager` class is implemented at `src/integrations/azure/realtime.ts` that manages connection lifecycle, group subscriptions, and event callbacks
- [ ] A SignalR negotiate Azure Function endpoint returns connection info scoped to the authenticated user
- [ ] The following SignalR groups are supported: `mission-radio:{missionId}`, `global-dispatch`, `telemetry:{missionId}`, `pilot-positions`
- [ ] All existing `supabase.channel()` and `postgres_changes` subscriptions in `useMissionLogs` are replaced with equivalent SignalR group subscriptions
- [ ] Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s) is implemented, with a "Connection Lost" UI banner during disconnection
- [ ] On reconnect, the client re-joins all active groups and performs a catch-up fetch for missed messages
- [ ] Azure SignalR Service Standard tier with 1 unit is provisioned (supports 1000 concurrent connections)

## Requirement 7: Azure Blob Storage and CDN
### User Story
As a user, I want all static assets (audio files, images, downloads) served from Azure Blob Storage with CDN caching so that load times are fast and Supabase storage dependencies are removed.

### Acceptance Criteria
- [ ] All assets from the Supabase `operational-assets` storage bucket are migrated to an Azure Blob Storage container
- [ ] Azure CDN (Standard Microsoft tier) is configured in front of the Blob Storage account
- [ ] All hardcoded Supabase storage URLs in the codebase (e.g., `https://orhfcrrydmgxradibbqb.supabase.co/storage/v1/object/public/...` in `DispatcherChat.tsx` and `BridgeChat.tsx`) are replaced with Azure CDN URLs
- [ ] Immutable audio assets have `Cache-Control: public, max-age=31536000` headers
- [ ] TTS audio generated by the dispatch agent is stored in Blob Storage and returned as a CDN URL

## Requirement 8: Frontend Hook Migration
### User Story
As a developer, I want every Supabase-dependent hook migrated to use the Azure client abstraction so that the Supabase SDK can be fully removed from the project.

### Acceptance Criteria
- [ ] All 16 hooks are migrated to use `azureClient.functions.invoke()` instead of direct `supabase.from()` calls: `useConfig`, `useAchievements`, `useHemsData`, `useMissionLogs`, `useCommunityPosts`, `useLivePilots`, `useProfiles`, `useHospitalManagement`, `useHelicopterManagement`, `useDownloads`, `useNotams`, `useMissions`, `useIncidentReports`, `useUserRole`, `useLocalBridge`, `useMissionLogs`
- [ ] The return type of every migrated hook is identical to its pre-migration signature so that no consuming component requires changes
- [ ] Integration files `src/integrations/dispatch/api.ts` and `src/integrations/simulator/api.ts` are updated to call Azure Functions endpoints instead of Supabase Edge Function URLs
- [ ] The `src/integrations/supabase/` directory and all `@supabase/*` package dependencies are removed after full cutover
- [ ] The strangler-fig migration is executed hook-by-hook with shadow mode validation (48h per hook) before switching to Azure

## Requirement 9: Electron App Optimization
### User Story
As a developer publishing to GitHub, I want the Electron app build artifacts reduced in size so that releases upload quickly and users download smaller installers.

### Acceptance Criteria
- [ ] The Windows NSIS installer targets only `x64` architecture (dropping `ia32`), reducing installer size by ~60MB
- [ ] `electron-builder.json` is updated with `"asar": true` and `"compression": "maximum"`
- [ ] macOS DMG targets `arm64` and `x64` separately (or universal) instead of the current `universal` single binary
- [ ] Differential/delta updates are enabled via `electron-updater` so subsequent updates download only changed blocks (<5MB typical)
- [ ] The renderer sandbox is enabled (`sandbox: true` in `webPreferences`) for improved security
- [ ] The final Windows installer is ≤85MB and macOS DMG is ≤90MB

## Requirement 10: Simulator Plugin Overhaul — X-Plane
### User Story
As an X-Plane pilot, I want a native C/C++ plugin that reads simulator datarefs and sends telemetry to the local bridge, replacing the current Lua script + Web API approach for better performance and reliability.

### Acceptance Criteria
- [ ] A native X-Plane plugin is built using X-Plane SDK 4.0 (C/C++ headers) with a CMake build system
- [ ] The plugin reads the same datarefs currently used: latitude, longitude, elevation, groundspeed, true_psi, vh_ind_fpm, m_fuel_total, n1_percent
- [ ] Telemetry is sent to the Local Bridge v2 at `http://localhost:8080/telemetry` via HTTP POST, throttled to 1Hz
- [ ] Unit conversions (meters→feet, m/s→knots, kg→lbs) are performed in the plugin before sending
- [ ] The plugin includes a settings UI or config file for bridge host/port configuration
- [ ] The existing Lua script (`hems-dispatch-xp.lua`) is deprecated and replaced by the native plugin

## Requirement 11: Simulator Plugin Overhaul — MSFS
### User Story
As an MSFS pilot, I want a native SimConnect plugin that reads simulator variables and sends telemetry to the local bridge, providing the same live tracking experience as X-Plane users.

### Acceptance Criteria
- [ ] An MSFS plugin is built using the MSFS SDK (SimConnect C++ API) and/or WASM gauge toolkit
- [ ] The plugin reads equivalent SimVars: PLANE LATITUDE, PLANE LONGITUDE, PLANE ALTITUDE, GROUND VELOCITY, HEADING INDICATOR, VERTICAL SPEED, FUEL TOTAL QUANTITY, ENG N1 RPM
- [ ] Telemetry is sent to the Local Bridge v2 at `http://localhost:8080/telemetry` via HTTP POST, throttled to 1Hz
- [ ] The plugin follows the same `TelemetryData` interface used by the X-Plane plugin and bridge server
- [ ] The plugin is packaged as a community folder addon installable by users

## Requirement 12: Local Bridge v2
### User Story
As a simulator pilot, I want the local bridge server to relay telemetry and chat messages between my simulator plugin and the Azure cloud backend, authenticated via API key.

### Acceptance Criteria
- [ ] The Local Bridge v2 Express server at `localhost:8080` accepts telemetry POSTs from both X-Plane and MSFS plugins
- [ ] The bridge relays telemetry to Azure API Management at `POST /api/update-telemetry` with API key authentication
- [ ] The bridge relays chat messages to `POST /api/dispatch-agent` via the chat-relay endpoint
- [ ] The bridge provides `GET /api/status` returning `BridgeStatus` (simConnected, cloudConnected, activeMissionId)
- [ ] The bridge provides `POST /api/mission-context` to fetch active missions from Azure using the stored API key
- [ ] All Supabase Edge Function URLs in the bridge are replaced with Azure Functions endpoints

## Requirement 13: AI Agent Redesign — Azure OpenAI
### User Story
As a crew member communicating with dispatch, I want the AI dispatch agent to respond with contextually accurate, HEMS radio protocol-formatted messages powered by Azure OpenAI, replacing the current Gemini-based implementation.

### Acceptance Criteria
- [ ] The `dispatch-agent` Azure Function uses Azure OpenAI Service (GPT-4o deployment) for chat completions instead of Google Gemini
- [ ] The system prompt is redesigned specifically for HEMS dispatch operations, including radio protocol formatting, mission-phase awareness, and patient context
- [ ] The function fetches full mission context (crew, patient, waypoints, current phase, weather) from Azure SQL before calling the AI
- [ ] Azure Speech Service (neural TTS voices) replaces the current TTS implementation for radio audio synthesis
- [ ] Generated TTS audio is stored in Azure Blob Storage and returned as a CDN URL
- [ ] The `tactical-analyst` function is similarly migrated to Azure OpenAI for scenario generation and flight review
- [ ] On AI service failure, a fallback response ("Dispatch is experiencing high traffic. Stand by.") is returned with no audio
- [ ] Request queuing with priority (dispatch-agent > tactical-analyst) is implemented to handle rate limits

## Requirement 14: Environment Configuration and Secrets
### User Story
As a developer, I want all Azure service credentials managed via environment variables and Azure Key Vault so that no secrets are hardcoded in the codebase.

### Acceptance Criteria
- [ ] The `.env` and `.env.local` files are updated to replace all `SUPABASE_*` variables with Azure equivalents: `VITE_AZURE_B2C_CLIENT_ID`, `VITE_AZURE_B2C_AUTHORITY`, `VITE_AZURE_B2C_KNOWN_AUTHORITY`, `VITE_AZURE_API_SCOPE`, `VITE_AZURE_API_BASE_URL`, `VITE_AZURE_SIGNALR_ENDPOINT`, `VITE_AZURE_STORAGE_URL`
- [ ] The hardcoded Supabase URL and anon key in `src/integrations/supabase/client.ts` are removed
- [ ] Azure Functions access connection strings and API keys via Azure Key Vault with managed identity (no secrets in function app settings)
- [ ] CORS is configured on Azure Functions and API Management with an explicit origin allowlist
- [ ] The Supabase project credentials are rotated/disabled after full migration cutover

## Requirement 15: Azure Infrastructure Provisioning
### User Story
As a DevOps engineer, I want all Azure resources defined as Infrastructure as Code so that environments can be reproducibly provisioned and managed.

### Acceptance Criteria
- [ ] IaC templates (Bicep or Terraform) provision: Azure AD B2C tenant, Azure SQL Database (Standard S1), Cosmos DB (serverless/autoscale), Azure Functions Premium Plan (EP1), Azure SignalR Service (Standard, 1 unit), Azure Blob Storage (GPv2, Hot), Azure CDN, Azure API Management (Consumption), Azure Key Vault, Azure Application Insights, Azure OpenAI Service, Azure Speech Service
- [ ] Staging and production environments are defined with separate resource groups
- [ ] Azure Application Insights is configured for monitoring, logging, and alerting across all Azure Functions
- [ ] Autoscale rules are defined for Cosmos DB (400–4000 RU/s) and SignalR (scale to 2+ units at 500 concurrent connections)

## Requirement 16: Data Migration and Zero-Downtime Cutover
### User Story
As a product owner, I want the migration from Supabase to Azure executed with zero downtime so that no users experience service interruption during the transition.

### Acceptance Criteria
- [ ] A data migration script exports all Supabase PostgreSQL data and imports it into Azure SQL with type coercion (JSONB→NVARCHAR JSON, timestamptz→DATETIME2)
- [ ] All Supabase Storage assets are copied to Azure Blob Storage with matching paths
- [ ] The strangler-fig migration pattern is followed: shadow mode (48h per hook) → incremental cutover (24h monitoring per hook) → cleanup
- [ ] Feature flags control which backend each hook uses, with rollback possible within 5 minutes
- [ ] Shadow mode logs discrepancies between Supabase and Azure responses to Application Insights without affecting user-facing behavior
- [ ] After all hooks are on Azure with <0.1% discrepancy rate, the Supabase SDK and integration code are removed
