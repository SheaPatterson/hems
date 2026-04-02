// Azure CDN (Standard Microsoft tier)
// Fronts Blob Storage for fast static asset delivery

@description('CDN profile name')
param profileName string

@description('CDN endpoint name')
param endpointName string

@description('Blob Storage primary host (e.g. staccount.blob.core.windows.net)')
param storageHostName string

@description('Azure region')
param location string

@description('Resource tags')
param tags object

resource cdnProfile 'Microsoft.Cdn/profiles@2023-07-01-preview' = {
  name: profileName
  location: location
  tags: tags
  sku: {
    name: 'Standard_Microsoft'
  }
}

resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2023-07-01-preview' = {
  parent: cdnProfile
  name: endpointName
  location: location
  tags: tags
  properties: {
    isHttpAllowed: false
    isHttpsAllowed: true
    isCompressionEnabled: true
    contentTypesToCompress: [
      'text/plain'
      'text/html'
      'text/css'
      'application/javascript'
      'application/json'
      'image/svg+xml'
    ]
    origins: [
      {
        name: 'blob-origin'
        properties: {
          hostName: storageHostName
          originHostHeader: storageHostName
          httpsPort: 443
          priority: 1
          weight: 1000
          enabled: true
        }
      }
    ]
    deliveryPolicy: {
      rules: [
        {
          name: 'ImmutableAssetsCaching'
          order: 1
          conditions: [
            {
              name: 'UrlFileExtension'
              parameters: {
                typeName: 'DeliveryRuleUrlFileExtensionMatchConditionParameters'
                operator: 'Equal'
                matchValues: ['mp3', 'wav', 'ogg', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico']
                transforms: ['Lowercase']
                negateCondition: false
              }
            }
          ]
          actions: [
            {
              name: 'CacheExpiration'
              parameters: {
                typeName: 'DeliveryRuleCacheExpirationActionParameters'
                cacheBehavior: 'Override'
                cacheType: 'All'
                cacheDuration: '365.00:00:00'
              }
            }
            {
              name: 'ModifyResponseHeader'
              parameters: {
                typeName: 'DeliveryRuleHeaderActionParameters'
                headerAction: 'Overwrite'
                headerName: 'Cache-Control'
                value: 'public, max-age=31536000'
              }
            }
          ]
        }
      ]
    }
  }
}

output endpointHostName string = cdnEndpoint.properties.hostName
output profileName string = cdnProfile.name
