import { CosmosClient, Database, Container } from '@azure/cosmos';

/**
 * Cosmos DB client helper.
 *
 * Provides singleton access to the Cosmos DB database and containers
 * for telemetry, live pilot status, and telemetry summary data.
 *
 * Requirement 4: Cosmos DB for high-frequency data.
 */

let client: CosmosClient | null = null;
let database: Database | null = null;

function getClient(): CosmosClient {
  if (!client) {
    client = new CosmosClient({
      endpoint: process.env.COSMOS_DB_ENDPOINT || '',
      key: process.env.COSMOS_DB_KEY || '',
    });
  }
  return client;
}

function getDatabase(): Database {
  if (!database) {
    const dbName = process.env.COSMOS_DB_DATABASE || 'hems-ops';
    database = getClient().database(dbName);
  }
  return database;
}

/** Raw telemetry points — partition key: /mission_id, TTL: 24h */
export function getTelemetryContainer(): Container {
  return getDatabase().container('telemetry');
}

/** One doc per active pilot — partition key: /user_id, TTL: 15min */
export function getLivePilotStatusContainer(): Container {
  return getDatabase().container('live_pilot_status');
}

/** One summary doc per mission — partition key: /mission_id */
export function getTelemetrySummaryContainer(): Container {
  return getDatabase().container('telemetry_summary');
}
