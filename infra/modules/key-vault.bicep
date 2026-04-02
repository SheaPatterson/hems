// Azure Key Vault (Standard)
// Stores connection strings, API keys, and B2C secrets
// Azure Functions access via managed identity

@description('Key Vault name')
param name string

@description('Azure region')
param location string

@description('Resource tags')
param tags object

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    publicNetworkAccess: 'Enabled'
  }
}

output vaultUri string = keyVault.properties.vaultUri
output resourceId string = keyVault.id
output name string = keyVault.name
