// HEMS Ops Center — Azure Infrastructure
// Entry point: deploys all Azure resources for the platform migration
// Usage: az deployment group create -g <rg> -f main.bicep -p @parameters/staging.bicepparam

targetScope = 'resourceGroup'

// ─── Global Parameters ───
@description('Environment name (staging or production)')
@allowed(['staging', 'production'])
param environment string

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Project name prefix for resource naming')
param projectName string = 'hemsops'

@description('Azure AD B2C tenant name (e.g. hemsopsb2c). NOTE: B2C tenant creation is not supported via Bicep — create manually via Azure Portal.')
param b2cTenantName string = ''

@description('Azure SQL administrator login')
@secure()
param sqlAdminLogin string

@description('Azure SQL administrator password')
@secure()
param sqlAdminPassword string

@description('Cosmos DB autoscale max throughput (RU/s)')
param cosmosMaxThroughput int = 4000

@description('Cosmos DB autoscale min throughput (RU/s — used for documentation, autoscale handles minimum automatically)')
param cosmosMinThroughput int = 400

@description('SignalR unit count')
param signalRUnitCount int = 1

@description('Azure OpenAI model deployment name')
param openAiDeploymentName string = 'gpt-4o'

@description('Azure OpenAI model version')
param openAiModelVersion string = '2024-05-13'

@description('Tags applied to all resources')
param tags object = {
  project: 'hems-ops-center'
  environment: environment
  managedBy: 'bicep'
}

// ─── Naming Convention ───
var suffix = '${projectName}-${environment}'
var uniqueSuffix = uniqueString(resourceGroup().id, projectName, environment)
// Reference b2cTenantName and cosmosMinThroughput in outputs to suppress unused-param warnings
var _b2cRef = b2cTenantName
var _cosmosMinRef = cosmosMinThroughput

// ─── Modules ───

module appInsights 'modules/app-insights.bicep' = {
  name: 'appInsights'
  params: {
    name: 'ai-${suffix}'
    location: location
    tags: tags
  }
}

module keyVault 'modules/key-vault.bicep' = {
  name: 'keyVault'
  params: {
    name: 'kv-${projectName}-${take(uniqueSuffix, 8)}'
    location: location
    tags: tags
  }
}

module sqlDatabase 'modules/sql-database.bicep' = {
  name: 'sqlDatabase'
  params: {
    serverName: 'sql-${suffix}'
    databaseName: 'hemsopsdb'
    location: location
    adminLogin: sqlAdminLogin
    adminPassword: sqlAdminPassword
    tags: tags
  }
}

module cosmosDb 'modules/cosmos-db.bicep' = {
  name: 'cosmosDb'
  params: {
    accountName: 'cosmos-${projectName}-${take(uniqueSuffix, 8)}'
    location: location
    maxThroughput: cosmosMaxThroughput
    tags: tags
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    storageAccountName: 'st${projectName}${take(uniqueSuffix, 8)}'
    location: location
    tags: tags
  }
}

module cdn 'modules/cdn.bicep' = {
  name: 'cdn'
  params: {
    profileName: 'cdn-${suffix}'
    endpointName: 'cdnep-${projectName}-${take(uniqueSuffix, 8)}'
    storageHostName: storage.outputs.primaryBlobHost
    location: location
    tags: tags
  }
}

module functionApp 'modules/function-app.bicep' = {
  name: 'functionApp'
  params: {
    appName: 'func-${suffix}'
    location: location
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    appInsightsConnectionString: appInsights.outputs.connectionString
    storageAccountName: storage.outputs.storageAccountName
    tags: tags
  }
}

module signalR 'modules/signalr.bicep' = {
  name: 'signalR'
  params: {
    name: 'sigr-${suffix}'
    location: location
    unitCount: signalRUnitCount
    tags: tags
  }
}

module apiManagement 'modules/api-management.bicep' = {
  name: 'apiManagement'
  params: {
    name: 'apim-${suffix}'
    location: location
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    tags: tags
  }
}

module openAi 'modules/openai.bicep' = {
  name: 'openAi'
  params: {
    accountName: 'oai-${suffix}'
    location: location
    deploymentName: openAiDeploymentName
    modelVersion: openAiModelVersion
    tags: tags
  }
}

module speechService 'modules/speech.bicep' = {
  name: 'speechService'
  params: {
    name: 'speech-${suffix}'
    location: location
    tags: tags
  }
}

// ─── Outputs ───
output appInsightsInstrumentationKey string = appInsights.outputs.instrumentationKey
output sqlServerFqdn string = sqlDatabase.outputs.serverFqdn
output cosmosDbEndpoint string = cosmosDb.outputs.endpoint
output storageAccountName string = storage.outputs.storageAccountName
output storageBlobEndpoint string = storage.outputs.primaryBlobEndpoint
output cdnEndpointHostName string = cdn.outputs.endpointHostName
output functionAppDefaultHostName string = functionApp.outputs.defaultHostName
output signalRHostName string = signalR.outputs.hostName
output apiManagementGatewayUrl string = apiManagement.outputs.gatewayUrl
output keyVaultUri string = keyVault.outputs.vaultUri
output openAiEndpoint string = openAi.outputs.endpoint
output speechServiceEndpoint string = speechService.outputs.endpoint
output b2cTenantNameRef string = _b2cRef
output cosmosMinThroughputRef int = _cosmosMinRef
