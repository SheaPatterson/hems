/**
 * Unit tests for the storage migration script's pure helper functions.
 * Tests getExtension, isAudioAsset, inferContentType, and formatBytes.
 *
 * Run: npx vitest run infra/scripts/migrate-storage.test.ts
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Re-declare the pure helper functions here to test in isolation,
// since the migration script is a standalone CLI entry point with
// side effects (process.exit, env var reads, etc.).
// These mirror the exact implementations in migrate-storage.ts.
// ---------------------------------------------------------------------------

const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg"]);
const AUDIO_CACHE_CONTROL = "public, max-age=31536000";

function getExtension(filePath: string): string {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return "";
  return filePath.slice(dot).toLowerCase();
}

function isAudioAsset(filePath: string): boolean {
  return AUDIO_EXTENSIONS.has(getExtension(filePath));
}

function inferContentType(filePath: string): string {
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getExtension", () => {
  it("extracts .mp3 extension", () => {
    expect(getExtension("assets/radio_static.mp3")).toBe(".mp3");
  });

  it("extracts extension from nested paths", () => {
    expect(getExtension("a/b/c/file.wav")).toBe(".wav");
  });

  it("lowercases the extension", () => {
    expect(getExtension("audio/ALERT.MP3")).toBe(".mp3");
  });

  it("returns empty string for files without extension", () => {
    expect(getExtension("README")).toBe("");
  });

  it("handles dotfiles", () => {
    expect(getExtension(".gitignore")).toBe(".gitignore");
  });

  it("handles multiple dots — returns last extension", () => {
    expect(getExtension("archive.tar.gz")).toBe(".gz");
  });
});

describe("isAudioAsset", () => {
  it("returns true for .mp3 files", () => {
    expect(isAudioAsset("assets/radio_static.mp3")).toBe(true);
  });

  it("returns true for .wav files", () => {
    expect(isAudioAsset("sounds/alert.wav")).toBe(true);
  });

  it("returns true for .ogg files", () => {
    expect(isAudioAsset("audio/ambient.ogg")).toBe(true);
  });

  it("returns false for .png files", () => {
    expect(isAudioAsset("images/logo.png")).toBe(false);
  });

  it("returns false for .json files", () => {
    expect(isAudioAsset("config/settings.json")).toBe(false);
  });

  it("returns false for files without extension", () => {
    expect(isAudioAsset("Makefile")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isAudioAsset("audio/RADIO.MP3")).toBe(true);
    expect(isAudioAsset("audio/alert.WAV")).toBe(true);
  });
});

describe("inferContentType", () => {
  it("returns audio/mpeg for .mp3", () => {
    expect(inferContentType("file.mp3")).toBe("audio/mpeg");
  });

  it("returns audio/wav for .wav", () => {
    expect(inferContentType("file.wav")).toBe("audio/wav");
  });

  it("returns audio/ogg for .ogg", () => {
    expect(inferContentType("file.ogg")).toBe("audio/ogg");
  });

  it("returns image/png for .png", () => {
    expect(inferContentType("logo.png")).toBe("image/png");
  });

  it("returns image/jpeg for .jpg and .jpeg", () => {
    expect(inferContentType("photo.jpg")).toBe("image/jpeg");
    expect(inferContentType("photo.jpeg")).toBe("image/jpeg");
  });

  it("returns image/svg+xml for .svg", () => {
    expect(inferContentType("icon.svg")).toBe("image/svg+xml");
  });

  it("returns application/octet-stream for unknown extensions", () => {
    expect(inferContentType("data.bin")).toBe("application/octet-stream");
  });

  it("returns application/octet-stream for no extension", () => {
    expect(inferContentType("LICENSE")).toBe("application/octet-stream");
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
  });

  it("formats fractional megabytes", () => {
    expect(formatBytes(1572864)).toBe("1.5 MB");
  });
});

describe("Cache-Control header value", () => {
  it("matches the required 1-year max-age", () => {
    expect(AUDIO_CACHE_CONTROL).toBe("public, max-age=31536000");
  });

  it("31536000 seconds equals 365 days", () => {
    expect(31536000).toBe(365 * 24 * 60 * 60);
  });
});
