#!/usr/bin/env npx tsx
/**
 * Storage Migration Script: Supabase Storage → Azure Blob Storage
 *
 * Copies all assets from the Supabase `operational-assets` bucket to an
 * Azure Blob Storage container with matching paths. Sets Cache-Control
 * headers on immutable audio assets (.mp3, .wav, .ogg).
 *
 * Usage:
 *   npx tsx infra/scripts/migrate-storage.ts
 *   npx tsx infra/scripts/migrate-storage.ts --dry-run
 *
 * Environment variables:
 *   SUPABASE_URL              - Supabase project URL (e.g. https://xyz.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (full access)
 *   AZURE_STORAGE_CONNECTION_STRING - Azure Blob Storage connection string
 *
 * Requirements: 7.1, 7.2, 7.4, 16.2
 */

import { createClient } from "@supabase/supabase-js";
import {
  BlobServiceClient,
  ContainerClient,
} from "@azure/storage-blob";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DRY_RUN = process.argv.includes("--dry-run");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const SOURCE_BUCKET = "operational-assets";
const TARGET_CONTAINER = "operational-assets";

/** Audio extensions that receive immutable cache headers. */
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg"]);

/** Cache-Control header for immutable audio assets (1 year). */
const AUDIO_CACHE_CONTROL = "public, max-age=31536000";

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
 * Return the file extension (lowercased) from a path, e.g. ".mp3".
 */
export function getExtension(filePath: string): string {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return "";
  return filePath.slice(dot).toLowerCase();
}

/**
 * Determine whether a file path represents an audio asset that should
 * receive immutable cache headers.
 */
export function isAudioAsset(filePath: string): boolean {
  return AUDIO_EXTENSIONS.has(getExtension(filePath));
}

/**
 * Infer a MIME content type from the file extension.
 * Falls back to "application/octet-stream" for unknown types.
 */
export function inferContentType(filePath: string): string {
  const ext = getExtension(filePath);
  const map: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".json": "application/json",
    ".txt": "text/plain",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
  };
  return map[ext] ?? "application/octet-stream";
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

interface SupabaseFileObject {
  name: string;
  id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Recursively list all files in a Supabase Storage bucket/folder.
 * Supabase returns both files (with `id`) and folders (without `id`).
 */
async function listAllFiles(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  folder: string = ""
): Promise<string[]> {
  const paths: string[] = [];
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 1000 });

  if (error) {
    throw new Error(
      `Failed to list ${bucket}/${folder}: ${error.message}`
    );
  }

  if (!data) return paths;

  for (const item of data as SupabaseFileObject[]) {
    const fullPath = folder ? `${folder}/${item.name}` : item.name;

    if (item.id) {
      // It's a file
      paths.push(fullPath);
    } else {
      // It's a folder — recurse
      const nested = await listAllFiles(supabase, bucket, fullPath);
      paths.push(...nested);
    }
  }

  return paths;
}

// ---------------------------------------------------------------------------
// Core migration logic
// ---------------------------------------------------------------------------

interface MigrationResult {
  path: string;
  status: "uploaded" | "skipped" | "failed";
  sizeBytes: number;
  cacheControl: string | null;
  error?: string;
}

async function migrateFile(
  supabase: ReturnType<typeof createClient>,
  containerClient: ContainerClient,
  filePath: string
): Promise<MigrationResult> {
  const audio = isAudioAsset(filePath);
  const cacheControl = audio ? AUDIO_CACHE_CONTROL : null;

  if (DRY_RUN) {
    return {
      path: filePath,
      status: "skipped",
      sizeBytes: 0,
      cacheControl,
    };
  }

  // Download from Supabase
  const { data, error } = await supabase.storage
    .from(SOURCE_BUCKET)
    .download(filePath);

  if (error || !data) {
    return {
      path: filePath,
      status: "failed",
      sizeBytes: 0,
      cacheControl,
      error: error?.message ?? "No data returned",
    };
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const contentType = inferContentType(filePath);

  // Upload to Azure Blob Storage
  const blockBlobClient = containerClient.getBlockBlobClient(filePath);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType,
      ...(cacheControl ? { blobCacheControl: cacheControl } : {}),
    },
  });

  return {
    path: filePath,
    status: "uploaded",
    sizeBytes: buffer.length,
    cacheControl,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log("=== HEMS Ops Center: Supabase Storage → Azure Blob Storage Migration ===");
  if (DRY_RUN) {
    log("*** DRY RUN MODE — no files will be uploaded to Azure ***");
  }

  // Validate env vars
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    logError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    process.exit(1);
  }
  if (!DRY_RUN && !AZURE_STORAGE_CONNECTION_STRING) {
    logError(
      "AZURE_STORAGE_CONNECTION_STRING is required (or use --dry-run)"
    );
    process.exit(1);
  }

  // Connect to Supabase
  log("Connecting to Supabase Storage...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Connect to Azure Blob Storage
  let containerClient: ContainerClient | null = null;
  if (!DRY_RUN) {
    log("Connecting to Azure Blob Storage...");
    const blobService = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING!
    );
    containerClient = blobService.getContainerClient(TARGET_CONTAINER);
    await containerClient.createIfNotExists({ access: "blob" });
    log(`Azure container '${TARGET_CONTAINER}' ready`);
  }

  // List all files in the source bucket
  log(`Listing files in Supabase bucket '${SOURCE_BUCKET}'...`);
  const files = await listAllFiles(supabase, SOURCE_BUCKET);
  log(`Found ${files.length} files to migrate`);

  if (files.length === 0) {
    log("No files found — nothing to migrate");
    process.exit(0);
  }

  // Migrate each file
  const results: MigrationResult[] = [];
  let uploaded = 0;
  let failed = 0;
  let totalBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const progress = `[${i + 1}/${files.length}]`;

    try {
      const result = await migrateFile(
        supabase,
        containerClient!,
        filePath
      );
      results.push(result);

      if (result.status === "uploaded") {
        uploaded++;
        totalBytes += result.sizeBytes;
        log(
          `${progress} ✓ ${filePath} (${formatBytes(result.sizeBytes)})${result.cacheControl ? " [cached]" : ""}`
        );
      } else if (result.status === "skipped") {
        log(
          `${progress} ~ ${filePath} (dry run)${result.cacheControl ? " [would set cache]" : ""}`
        );
      } else {
        failed++;
        logError(`${progress} ✗ ${filePath}: ${result.error}`);
      }
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      logError(`${progress} ✗ ${filePath}: ${message}`);
      results.push({
        path: filePath,
        status: "failed",
        sizeBytes: 0,
        cacheControl: null,
        error: message,
      });
    }
  }

  // Print summary
  log("");
  log("=== Migration Summary ===");
  log(`Total files found:    ${files.length}`);
  log(`Uploaded:             ${uploaded}`);
  log(`Failed:               ${failed}`);
  log(`Skipped (dry run):    ${results.filter((r) => r.status === "skipped").length}`);
  log(`Total size:           ${formatBytes(totalBytes)}`);

  const audioFiles = results.filter(
    (r) => r.cacheControl === AUDIO_CACHE_CONTROL
  );
  log(`Audio assets (cached): ${audioFiles.length}`);

  if (failed > 0) {
    log("");
    log("Failed files:");
    for (const r of results.filter((r) => r.status === "failed")) {
      log(`  - ${r.path}: ${r.error}`);
    }
    logError("Migration completed with errors");
  } else {
    log(
      DRY_RUN
        ? "Dry run complete — no files were uploaded"
        : "Migration completed successfully"
    );
  }

  process.exit(failed > 0 ? 1 : 0);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

main().catch((err) => {
  logError(
    `Unhandled error: ${err instanceof Error ? err.message : String(err)}`
  );
  process.exit(1);
});
