#!/usr/bin/env npx tsx
/**
 * Data Migration Script: Supabase PostgreSQL → Azure SQL
 *
 * Exports all rows from Supabase PostgreSQL and imports them into Azure SQL
 * with type coercion for JSONB, timestamptz, and UUID columns.
 *
 * Usage:
 *   npx tsx infra/scripts/migrate-data.ts
 *   npx tsx infra/scripts/migrate-data.ts --dry-run
 *
 * Environment variables:
 *   SUPABASE_DB_URL          - PostgreSQL connection string (e.g. postgresql://user:pass@host:5432/db)
 *   AZURE_SQL_CONNECTION_STRING - Azure SQL connection string (e.g. Server=...;Database=...;User Id=...;Password=...;Encrypt=true)
 *
 * Requirements: 3.6, 16.1
 */

import pg from "pg";
import sql from "mssql";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DRY_RUN = process.argv.includes("--dry-run");

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const AZURE_SQL_CONNECTION_STRING = process.env.AZURE_SQL_CONNECTION_STRING;

/**
 * Tables to migrate, in dependency order (parents before children).
 * Each entry maps the table name to metadata about its columns so we can
 * apply the correct type coercion during INSERT.
 */
const TABLES_TO_MIGRATE = [
  "hospitals",
  "helicopters",
  "hems_bases",
  "profiles",
  "user_roles",
  "missions",
  "achievements",
  "community_posts",
  "incident_reports",
  "notams",
  "downloads",
  "config",
  "logs",
  "mission_radio_logs",
  "global_dispatch_logs",
  "content_pages",
  "base_scenery",
  "hospital_scenery",
] as const;

/**
 * Columns that contain JSON data in Supabase (JSONB) and need to be
 * JSON.stringify'd before inserting into Azure SQL NVARCHAR(MAX).
 */
const JSON_COLUMNS: Record<string, Set<string>> = {
  missions: new Set([
    "hems_base",
    "helicopter",
    "crew",
    "origin",
    "pickup",
    "destination",
    "patient_details",
    "medical_response",
    "waypoints",
    "tracking",
    "live_data",
    "flight_summary",
  ]),
  profiles: new Set(["social_links"]),
  base_scenery: new Set(["image_urls"]),
  hospital_scenery: new Set(["image_urls"]),
};

/**
 * Columns that are boolean in Supabase (PostgreSQL bool) and need to be
 * converted to BIT (0/1) for Azure SQL.
 */
const BOOLEAN_COLUMNS: Record<string, Set<string>> = {
  hospitals: new Set(["is_trauma_center"]),
  profiles: new Set(["is_subscribed"]),
  notams: new Set(["active"]),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function logError(msg: string) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] ERROR: ${msg}`);
}

/**
 * Coerce a single row's values for Azure SQL compatibility.
 *  - JSONB objects/arrays → JSON.stringify
 *  - Timestamps → ISO 8601 string (Azure SQL DATETIME2 accepts this)
 *  - Booleans → 0 or 1 (BIT)
 *  - UUIDs → pass through as-is (string format works for UNIQUEIDENTIFIER)
 */
function coerceRow(
  table: string,
  row: Record<string, unknown>
): Record<string, unknown> {
  const jsonCols = JSON_COLUMNS[table];
  const boolCols = BOOLEAN_COLUMNS[table];
  const coerced: Record<string, unknown> = {};

  for (const [col, val] of Object.entries(row)) {
    if (val === null || val === undefined) {
      coerced[col] = null;
      continue;
    }

    // JSON columns: stringify objects/arrays
    if (jsonCols?.has(col)) {
      coerced[col] =
        typeof val === "object" ? JSON.stringify(val) : String(val);
      continue;
    }

    // Boolean columns: convert to 0/1
    if (boolCols?.has(col)) {
      coerced[col] = val ? 1 : 0;
      continue;
    }

    // Timestamps (Date objects from pg driver): convert to ISO string
    if (val instanceof Date) {
      coerced[col] = val.toISOString();
      continue;
    }

    // Everything else (strings, numbers, UUIDs) passes through
    coerced[col] = val;
  }

  return coerced;
}

/**
 * Map a JS value to the appropriate mssql type for parameterized queries.
 */
function getMssqlType(value: unknown): sql.ISqlTypeFactoryWithNoParams {
  if (value === null || value === undefined) return sql.NVarChar;
  if (typeof value === "number") {
    return Number.isInteger(value) ? sql.Int : sql.Float;
  }
  if (typeof value === "boolean") return sql.Bit;
  return sql.NVarChar;
}

/**
 * Escape a column name for Azure SQL (bracket-quote reserved words).
 */
function escapeCol(col: string): string {
  return `[${col}]`;
}

// ---------------------------------------------------------------------------
// Core migration logic
// ---------------------------------------------------------------------------

async function fetchAllRows(
  pgClient: pg.Client,
  table: string
): Promise<Record<string, unknown>[]> {
  const result = await pgClient.query(`SELECT * FROM "${table}"`);
  return result.rows;
}

/**
 * Bulk-insert rows into Azure SQL using parameterized batches.
 * We batch in groups of 100 to stay well within parameter limits.
 */
async function insertRows(
  pool: sql.ConnectionPool,
  table: string,
  rows: Record<string, unknown>[]
): Promise<number> {
  if (rows.length === 0) return 0;

  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    for (const row of batch) {
      const columns = Object.keys(row);
      const request = pool.request();

      columns.forEach((col, idx) => {
        const paramName = `p${idx}`;
        const value = row[col];
        request.input(paramName, getMssqlType(value), value ?? null);
      });

      const colList = columns.map(escapeCol).join(", ");
      const paramList = columns.map((_, idx) => `@p${idx}`).join(", ");
      const query = `INSERT INTO [${table}] (${colList}) VALUES (${paramList})`;

      await request.query(query);
      inserted++;
    }
  }

  return inserted;
}

async function countAzureRows(
  pool: sql.ConnectionPool,
  table: string
): Promise<number> {
  const result = await pool.request().query(`SELECT COUNT(*) AS cnt FROM [${table}]`);
  return result.recordset[0].cnt;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function migrateTable(
  pgClient: pg.Client,
  azurePool: sql.ConnectionPool,
  table: string
): Promise<{ source: number; inserted: number; target: number }> {
  log(`[${table}] Fetching rows from Supabase...`);
  const rows = await fetchAllRows(pgClient, table);
  log(`[${table}] Found ${rows.length} rows in Supabase`);

  if (rows.length === 0) {
    const target = DRY_RUN ? 0 : await countAzureRows(azurePool, table);
    return { source: 0, inserted: 0, target };
  }

  // Coerce types for Azure SQL
  const coercedRows = rows.map((row) => coerceRow(table, row));

  if (DRY_RUN) {
    log(`[${table}] DRY RUN — skipping insert of ${coercedRows.length} rows`);
    return { source: rows.length, inserted: 0, target: 0 };
  }

  log(`[${table}] Inserting ${coercedRows.length} rows into Azure SQL...`);
  const inserted = await insertRows(azurePool, table, coercedRows);
  const target = await countAzureRows(azurePool, table);

  return { source: rows.length, inserted, target };
}

async function main() {
  log("=== HEMS Ops Center: Supabase → Azure SQL Data Migration ===");
  if (DRY_RUN) {
    log("*** DRY RUN MODE — no data will be written to Azure SQL ***");
  }

  // Validate env vars
  if (!SUPABASE_DB_URL) {
    logError("SUPABASE_DB_URL environment variable is required");
    process.exit(1);
  }
  if (!DRY_RUN && !AZURE_SQL_CONNECTION_STRING) {
    logError("AZURE_SQL_CONNECTION_STRING environment variable is required (or use --dry-run)");
    process.exit(1);
  }

  // Connect to Supabase PostgreSQL
  log("Connecting to Supabase PostgreSQL...");
  const pgClient = new pg.Client({ connectionString: SUPABASE_DB_URL });
  await pgClient.connect();
  log("Connected to Supabase PostgreSQL");

  // Connect to Azure SQL (skip in dry-run if no connection string)
  let azurePool: sql.ConnectionPool | null = null;
  if (!DRY_RUN) {
    log("Connecting to Azure SQL...");
    azurePool = await sql.connect(AZURE_SQL_CONNECTION_STRING!);
    log("Connected to Azure SQL");
  }

  // Migrate each table
  const results: Array<{
    table: string;
    source: number;
    inserted: number;
    target: number;
    match: boolean;
  }> = [];

  let hasErrors = false;

  for (const table of TABLES_TO_MIGRATE) {
    try {
      const result = await migrateTable(pgClient, azurePool!, table);
      const match = DRY_RUN ? true : result.source === result.target;
      results.push({ table, ...result, match });

      if (!match) {
        logError(
          `[${table}] ROW COUNT MISMATCH: source=${result.source}, target=${result.target}`
        );
        hasErrors = true;
      } else {
        log(`[${table}] ✓ ${result.source} rows migrated successfully`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logError(`[${table}] Migration failed: ${message}`);
      results.push({ table, source: -1, inserted: 0, target: -1, match: false });
      hasErrors = true;
    }
  }

  // Print summary
  log("");
  log("=== Migration Summary ===");
  log(
    `${"Table".padEnd(25)} ${"Source".padStart(8)} ${"Inserted".padStart(10)} ${"Target".padStart(8)} ${"Status".padStart(10)}`
  );
  log("-".repeat(65));

  for (const r of results) {
    const status = r.source === -1 ? "FAILED" : r.match ? "OK" : "MISMATCH";
    log(
      `${r.table.padEnd(25)} ${String(r.source).padStart(8)} ${String(r.inserted).padStart(10)} ${String(r.target).padStart(8)} ${status.padStart(10)}`
    );
  }

  log("-".repeat(65));
  const totalSource = results.reduce((s, r) => s + Math.max(r.source, 0), 0);
  const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
  const totalTarget = results.reduce((s, r) => s + Math.max(r.target, 0), 0);
  log(
    `${"TOTAL".padEnd(25)} ${String(totalSource).padStart(8)} ${String(totalInserted).padStart(10)} ${String(totalTarget).padStart(8)}`
  );

  if (hasErrors) {
    logError("Migration completed with errors — review the table above");
  } else {
    log(DRY_RUN ? "Dry run complete — no data was written" : "Migration completed successfully with zero data loss");
  }

  // Cleanup
  await pgClient.end();
  if (azurePool) await azurePool.close();

  process.exit(hasErrors ? 1 : 0);
}

main().catch((err) => {
  logError(`Unhandled error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
