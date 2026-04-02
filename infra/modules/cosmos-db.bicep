// Azure Cosmos DB (Autoscale)
// Containers: telemetry (/mission_id, TTL 86400s), live_pilot_status (/user_id, TTL 900s),
//             telemetry_summary (/mission_id)
// Autoscale: 400–4000 RU/s on telemetry container

@description('Cosmos DB account name')
param accountName string

@description('Azure region')
param location string

@description('Max autoscale throughput (RU/s)')
param maxThroughput int = 4000

@description('Resource tags')
param tags object

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-02-15-preview' = {
  name: accountName
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    enableAutomaticFailover: false
    enableMultipleWriteLocations: false
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-02-15-preview' = {
  parent: cosmosAccount
  name: 'hemsops'
  properties: {
    resource: {
      id: 'hemsops'
    }
  }
}

// Telemetry container — partition key: /mission_id, TTL: 86400s (24h)
// Autoscale 400–4000 RU/s
resource telemetryContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-02-15-preview' = {
  parent: database
  name: 'telemetry'
  properties: {
    resource: {
      id: 'telemetry'
      partitionKey: {
        paths: ['/mission_id']
        kind: 'Hash'
      }
      defaultTtl: 86400
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          { path: '/*' }
        ]
        excludedPaths: [
          { path: '/"_etag"/?' }
        ]
      }
    }
    options: {
      autoscaleSettings: {
        maxThroughput: maxThroughput
      }
    }
  }
}

// Live Pilot Status container — partition key: /user_id, TTL: 900s (15min)
resource livePilotContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-02-15-preview' = {
  parent: database
  name: 'live_pilot_status'
  properties: {
    resource: {
      id: 'live_pilot_status'
      partitionKey: {
        paths: ['/user_id']
        kind: 'Hash'
      }
      defaultTtl: 900
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          { path: '/*' }
        ]
        excludedPaths: [
          { path: '/"_etag"/?' }
        ]
      }
    }
    options: {
      autoscaleSettings: {
        maxThroughput: maxThroughput
      }
    }
  }
}

// Telemetry Summary container — partition key: /mission_id, no TTL
resource telemetrySummaryContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-02-15-preview' = {
  parent: database
  name: 'telemetry_summary'
  properties: {
    resource: {
      id: 'telemetry_summary'
      partitionKey: {
        paths: ['/mission_id']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          { path: '/*' }
        ]
        excludedPaths: [
          { path: '/"_etag"/?' }
        ]
      }
    }
    options: {
      autoscaleSettings: {
        maxThroughput: maxThroughput
      }
    }
  }
}

output endpoint string = cosmosAccount.properties.documentEndpoint
output accountName string = cosmosAccount.name
output accountId string = cosmosAccount.id
