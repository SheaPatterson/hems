# Implementation Plan: Azure Platform Migration

## Overview

Migrate the HEMS Ops Center from Supabase to Azure using a strangler-fig pattern. The implementation proceeds in layers: infrastructure and environment first, then the Azure client abstraction and auth, followed by the API layer and data stores, realtime, storage, hook-by-hook frontend migration, simulator plugins, Electron optimization, AI agent redesign, and finally data migration with zero-downtime cutover.

## Tasks

- [x] 1. Create Azure environment variables and configuration files
- [x] 2. Write IaC templates for Azure resource provisioning
- [x] 3. Implement the AzureClient interface and factory function
- [x] 4. Implement the QueryBuilder for database abstraction
- [x] 5. Implement the feature-flag migration utility
- [x] 6. Implement AzureAuthProvider and useAuth hook
- [x] 7. Update AuthGuard and AdminGuard to work with Azure auth
- [x] 8. Replace Supabase login UI with MSAL-based login
- [x] 9. Create Azure SQL schema migration scripts
- [x] 10. Write data migration script from Supabase PostgreSQL to Azure SQL
- [x] 11. Provision and configure Cosmos DB containers
- [x] 12. Set up Azure Functions project with JWT middleware
- [x] 13. Implement CRUD Azure Functions for all data entities
- [x] 14. Implement mission radio log and dispatch log endpoints with SignalR broadcast
- [x] 15. Implement telemetry Azure Function with Cosmos DB and SignalR
- [x] 16. Implement simulator-specific Azure Functions
- [x] 17. Implement SignalR negotiate function
- [x] 18. Implement SignalRManager class
- [x] 19. Implement Connection Lost UI banner
- [x] 20. Migrate Supabase storage assets to Azure Blob Storage
- [x] 21. Replace all hardcoded Supabase storage URLs in the codebase
- [x] 22. Implement dispatch-agent Azure Function with Azure OpenAI
- [x] 23. Implement Azure Speech Service TTS
- [x] 24. Migrate tactical-analyst function to Azure OpenAI
- [x] 25. Migrate data-fetching hooks to Azure
- [x] 26. Migrate mission hooks to Azure
- [x] 27. Migrate management hooks to Azure
- [x] 28. Migrate community and safety hooks to Azure
- [x] 29. Migrate live data hooks to Azure
- [x] 30. Migrate content hooks to Azure
- [x] 31. Update integration API files for dispatch and simulator
- [x] 32. Update Local Bridge server to relay to Azure
- [x] 33. Build native X-Plane C++ plugin
- [x] 34. Build MSFS SimConnect plugin
- [x] 35. Optimize Electron build configuration
- [x] 36. Execute data migration and storage asset copy
- [x] 37. Execute strangler-fig cutover sequence
- [x] 38. Cleanup and remove Supabase dependencies
