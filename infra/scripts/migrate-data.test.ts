/**
 * Unit tests for the data migration script's type coercion logic.
 * Tests the core coerceRow function that handles JSONB→string, bool→BIT,
 * timestamp→ISO string, and UUID passthrough conversions.
 *
 * Run: npx vitest run infra/scripts/migrate-data.test.ts
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// We re-declare the pure coercion logic here to test it in isolation,
// since the migration script is a standalone CLI entry point with side effects.
// These mirror the exact implementations in migrate-data.ts.
// ---------------------------------------------------------------------------

const JSON_COLUMNS: Record<string, Set<string>> = {
  missions: new Set([
    "hems_base", "helicopter", "crew", "origin", "pickup",
    "destination", "patient_details", "medical_response",
    "waypoints", "tracking", "live_data", "flight_summary",
  ]),
  profiles: new Set(["social_links"]),
  base_scenery: new Set(["image_urls"]),
  hospital_scenery: new Set(["image_urls"]),
};

const BOOLEAN_COLUMNS: Record<string, Set<string>> = {
  hospitals: new Set(["is_trauma_center"]),
  profiles: new Set(["is_subscribed"]),
  notams: new Set(["active"]),
};

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
    if (jsonCols?.has(col)) {
      coerced[col] = typeof val === "object" ? JSON.stringify(val) : String(val);
      continue;
    }
    if (boolCols?.has(col)) {
      coerced[col] = val ? 1 : 0;
      continue;
    }
    if (val instanceof Date) {
      coerced[col] = val.toISOString();
      continue;
    }
    coerced[col] = val;
  }

  return coerced;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("coerceRow", () => {
  describe("JSONB → NVARCHAR JSON (stringify)", () => {
    it("stringifies object values in JSON columns", () => {
      const row = {
        id: "abc-123",
        mission_id: "M-001",
        hems_base: { name: "Base Alpha", lat: 51.5 },
        crew: [{ role: "pilot", name: "Smith" }],
        status: "active",
      };

      const result = coerceRow("missions", row);

      expect(result.hems_base).toBe('{"name":"Base Alpha","lat":51.5}');
      expect(result.crew).toBe('[{"role":"pilot","name":"Smith"}]');
      expect(result.status).toBe("active"); // non-JSON col unchanged
    });

    it("stringifies null JSON columns as null", () => {
      const row = { id: "abc", mission_id: "M-001", hems_base: null, crew: null };
      const result = coerceRow("missions", row);

      expect(result.hems_base).toBeNull();
      expect(result.crew).toBeNull();
    });

    it("converts already-string JSON column values via String()", () => {
      const row = { id: "abc", mission_id: "M-001", hems_base: "already a string" };
      const result = coerceRow("missions", row);

      expect(result.hems_base).toBe("already a string");
    });

    it("handles profiles social_links JSON column", () => {
      const row = {
        id: "user-1",
        social_links: { twitter: "@pilot", discord: "pilot#1234" },
      };
      const result = coerceRow("profiles", row);

      expect(result.social_links).toBe('{"twitter":"@pilot","discord":"pilot#1234"}');
    });

    it("handles base_scenery image_urls JSON column", () => {
      const row = {
        id: "bs-1",
        base_id: "base-1",
        image_urls: ["https://cdn.example.com/img1.jpg", "https://cdn.example.com/img2.jpg"],
      };
      const result = coerceRow("base_scenery", row);

      expect(result.image_urls).toBe(
        '["https://cdn.example.com/img1.jpg","https://cdn.example.com/img2.jpg"]'
      );
    });
  });

  describe("Boolean → BIT (0/1)", () => {
    it("converts true to 1 and false to 0 for hospital is_trauma_center", () => {
      const rowTrue = { id: "h-1", name: "Hospital A", is_trauma_center: true };
      const rowFalse = { id: "h-2", name: "Hospital B", is_trauma_center: false };

      expect(coerceRow("hospitals", rowTrue).is_trauma_center).toBe(1);
      expect(coerceRow("hospitals", rowFalse).is_trauma_center).toBe(0);
    });

    it("converts notams active boolean", () => {
      const row = { id: "n-1", title: "Test", active: true };
      expect(coerceRow("notams", row).active).toBe(1);
    });

    it("converts profiles is_subscribed boolean", () => {
      const row = { id: "u-1", is_subscribed: false };
      expect(coerceRow("profiles", row).is_subscribed).toBe(0);
    });
  });

  describe("timestamptz → DATETIME2 (ISO string)", () => {
    it("converts Date objects to ISO 8601 strings", () => {
      const date = new Date("2025-06-15T14:30:00.000Z");
      const row = { id: "m-1", created_at: date };
      const result = coerceRow("missions", row);

      expect(result.created_at).toBe("2025-06-15T14:30:00.000Z");
      expect(typeof result.created_at).toBe("string");
    });

    it("handles multiple timestamp columns in the same row", () => {
      const row = {
        id: "cp-1",
        slug: "about",
        created_at: new Date("2025-01-01T00:00:00Z"),
        updated_at: new Date("2025-06-01T12:00:00Z"),
      };
      const result = coerceRow("content_pages", row);

      expect(result.created_at).toBe("2025-01-01T00:00:00.000Z");
      expect(result.updated_at).toBe("2025-06-01T12:00:00.000Z");
    });
  });

  describe("UUID passthrough", () => {
    it("passes UUID strings through unchanged", () => {
      const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      const row = { id: uuid, name: "Test Hospital" };
      const result = coerceRow("hospitals", row);

      expect(result.id).toBe(uuid);
    });
  });

  describe("null handling", () => {
    it("converts null values to null", () => {
      const row = { id: "h-1", name: "Test", faa_identifier: null, trauma_level: null };
      const result = coerceRow("hospitals", row);

      expect(result.faa_identifier).toBeNull();
      expect(result.trauma_level).toBeNull();
    });

    it("converts undefined values to null", () => {
      const row = { id: "h-1", name: "Test", faa_identifier: undefined };
      const result = coerceRow("hospitals", row);

      expect(result.faa_identifier).toBeNull();
    });
  });

  describe("numeric passthrough", () => {
    it("passes numbers through unchanged", () => {
      const row = { id: "h-1", latitude: 51.4775, longitude: -0.4614, trauma_level: 2 };
      const result = coerceRow("hospitals", row);

      expect(result.latitude).toBe(51.4775);
      expect(result.longitude).toBe(-0.4614);
      expect(result.trauma_level).toBe(2);
    });
  });

  describe("tables without special columns", () => {
    it("passes all values through for tables with no JSON/bool columns", () => {
      const row = {
        id: "lr-1",
        mission_id: "M-001",
        sender: "dispatch",
        message: "Roger that",
        timestamp: new Date("2025-03-01T10:00:00Z"),
        callsign: "HEMS-1",
      };
      const result = coerceRow("mission_radio_logs", row);

      expect(result.id).toBe("lr-1");
      expect(result.sender).toBe("dispatch");
      expect(result.timestamp).toBe("2025-03-01T10:00:00.000Z");
    });
  });

  describe("config table (key/value)", () => {
    it("passes string key/value through unchanged", () => {
      const row = {
        key: "site_name",
        value: "HEMS Ops Center",
        description: "The site display name",
        updated_at: new Date("2025-01-01T00:00:00Z"),
      };
      const result = coerceRow("config", row);

      expect(result.key).toBe("site_name");
      expect(result.value).toBe("HEMS Ops Center");
      expect(result.updated_at).toBe("2025-01-01T00:00:00.000Z");
    });
  });
});
