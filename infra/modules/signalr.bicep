// Azure SignalR Service (Standard tier)
// Supports realtime radio feeds, telemetry, and pilot positions
// Autoscale rule: scale to 2+ units at 500 concurrent connections

@description('SignalR Service name')
param name string

@description('Azure region')
param location string

@description('Number of SignalR units (1 unit = 1000 concurrent connections)')
param unitCount int = 1

@description('Resource tags')
param tags object

resource signalR 'Microsoft.SignalRService/signalR@2024-03-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Standard_S1'
    tier: 'Standard'
    capacity: unitCount
  }
  kind: 'SignalR'
  properties: {
    features: [
      {
        flag: 'ServiceMode'
        value: 'Serverless'
      }
      {
        flag: 'EnableConnectivityLogs'
        value: 'True'
      }
      {
        flag: 'EnableMessagingLogs'
        value: 'True'
      }
    ]
    cors: {
      allowedOrigins: ['*']
    }
    tls: {
      clientCertEnabled: false
    }
    upstream: {}
  }
}

// Autoscale: scale to 2+ units when concurrent connections exceed 500
resource signalRAutoscale 'Microsoft.Insights/autoscalesettings@2022-10-01' = {
  name: 'autoscale-${name}'
  location: location
  tags: tags
  properties: {
    enabled: true
    targetResourceUri: signalR.id
    profiles: [
      {
        name: 'ConnectionBasedScaling'
        capacity: {
          minimum: '1'
          maximum: '5'
          default: '1'
        }
        rules: [
          {
            metricTrigger: {
              metricName: 'ConnectionCount'
              metricResourceUri: signalR.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT5M'
              timeAggregation: 'Average'
              operator: 'GreaterThan'
              threshold: 500
            }
            scaleAction: {
              direction: 'Increase'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT10M'
            }
          }
          {
            metricTrigger: {
              metricName: 'ConnectionCount'
              metricResourceUri: signalR.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT10M'
              timeAggregation: 'Average'
              operator: 'LessThan'
              threshold: 250
            }
            scaleAction: {
              direction: 'Decrease'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT10M'
            }
          }
        ]
      }
    ]
  }
}

output hostName string = signalR.properties.hostName
output resourceId string = signalR.id
