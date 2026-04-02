using '../main.bicep'

param environment = 'staging'
param projectName = 'hemsops'
param b2cTenantName = 'hemsopsb2cstaging'
param sqlAdminLogin = readEnvironmentVariable('SQL_ADMIN_LOGIN', 'hemsopsadmin')
param sqlAdminPassword = readEnvironmentVariable('SQL_ADMIN_PASSWORD')
param cosmosMaxThroughput = 4000
param cosmosMinThroughput = 400
param signalRUnitCount = 1
param openAiDeploymentName = 'gpt-4o'
param openAiModelVersion = '2024-05-13'
param tags = {
  project: 'hems-ops-center'
  environment: 'staging'
  managedBy: 'bicep'
}
