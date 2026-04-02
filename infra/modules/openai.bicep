// Azure OpenAI Service with GPT-4o deployment
// Powers the dispatch agent and tactical analyst

@description('Azure OpenAI account name')
param accountName string

@description('Azure region')
param location string

@description('Model deployment name')
param deploymentName string = 'gpt-4o'

@description('Model version')
param modelVersion string = '2024-11-20'

@description('Resource tags')
param tags object

resource openAiAccount 'Microsoft.CognitiveServices/accounts@2024-04-01-preview' = {
  name: accountName
  location: location
  tags: tags
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    customSubDomainName: accountName
    publicNetworkAccess: 'Enabled'
  }
}

resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-04-01-preview' = {
  parent: openAiAccount
  name: deploymentName
  sku: {
    name: 'Standard'
    capacity: 30
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: modelVersion
    }
    raiPolicyName: 'Microsoft.DefaultV2'
  }
}

output endpoint string = openAiAccount.properties.endpoint
output accountName string = openAiAccount.name
output accountId string = openAiAccount.id
