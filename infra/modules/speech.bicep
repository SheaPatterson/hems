// Azure Speech Service (Standard S0)
// Neural TTS voices for dispatch radio audio synthesis

@description('Speech Service name')
param name string

@description('Azure region')
param location string

@description('Resource tags')
param tags object

resource speechService 'Microsoft.CognitiveServices/accounts@2024-04-01-preview' = {
  name: name
  location: location
  tags: tags
  kind: 'SpeechServices'
  sku: {
    name: 'S0'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    customSubDomainName: name
    publicNetworkAccess: 'Enabled'
  }
}

output endpoint string = speechService.properties.endpoint
output resourceId string = speechService.id
output name string = speechService.name
