// Azure API Management (Consumption tier)
// Gateway for all Azure Functions endpoints
// Provides rate limiting, caching, and request validation

@description('API Management service name')
param name string

@description('Azure region')
param location string

@description('Application Insights instrumentation key')
param appInsightsInstrumentationKey string

@description('Resource tags')
param tags object

resource apim 'Microsoft.ApiManagement/service@2023-09-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Consumption'
    capacity: 0
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    publisherEmail: 'admin@hemsops.com'
    publisherName: 'HEMS Ops Center'
  }
}

resource apimLogger 'Microsoft.ApiManagement/service/loggers@2023-09-01-preview' = {
  parent: apim
  name: 'appinsights-logger'
  properties: {
    loggerType: 'applicationInsights'
    credentials: {
      instrumentationKey: appInsightsInstrumentationKey
    }
    isBuffered: true
  }
}

output gatewayUrl string = apim.properties.gatewayUrl
output resourceId string = apim.id
output principalId string = apim.identity.principalId
