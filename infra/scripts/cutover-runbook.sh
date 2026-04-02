#!/usr/bin/env bash
# =============================================================================
# HEMS Ops Center — Azure Migration Cutover Runbook
# =============================================================================
# This script documents the exact steps for the zero-downtime migration
# from Supabase to Azure. Run each phase sequentially.
#
# Prerequisites:
#   - Azure infrastructure provisioned (run Bicep templates first)
#   - Azure SQL schema created (run infra/sql/001_create_tables.sql)
#   - Azure Functions deployed and passing health checks
#   - Environment variables configured in .env and .env.local
#
# Usage:
#   bash infra/scripts/cutover-runbook.sh [phase1|phase2|phase3]
# =============================================================================

set -euo pipefail

PHASE="${1:-help}"

case "$PHASE" in

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1: Data Migration
# ─────────────────────────────────────────────────────────────────────────────
phase1)
  echo "=== PHASE 1: Data Migration ==="
  echo ""

  echo "[1/4] Running data migration (Supabase PostgreSQL → Azure SQL)..."
  echo "  Dry run first to validate:"
  npx tsx infra/scripts/migrate-data.ts --dry-run
  echo ""
  read -p "Dry run complete. Proceed with actual migration? (y/N) " confirm
  if [[ "$confirm" != "y" ]]; then echo "Aborted."; exit 1; fi

  echo "[2/4] Executing data migration..."
  npx tsx infra/scripts/migrate-data.ts
  echo ""

  echo "[3/4] Running storage migration (Supabase Storage → Azure Blob)..."
  echo "  Dry run first:"
  npx tsx infra/scripts/migrate-storage.ts --dry-run
  echo ""
  read -p "Dry run complete. Proceed with storage migration? (y/N) " confirm
  if [[ "$confirm" != "y" ]]; then echo "Aborted."; exit 1; fi

  echo "[4/4] Executing storage migration..."
  npx tsx infra/scripts/migrate-storage.ts
  echo ""

  echo "=== PHASE 1 COMPLETE ==="
  echo "Verify: Check Azure SQL row counts and Blob Storage assets."
  echo "Next: Run 'bash infra/scripts/cutover-runbook.sh phase2'"
  ;;

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: Strangler-Fig Cutover (Shadow → Azure)
# ─────────────────────────────────────────────────────────────────────────────
phase2)
  echo "=== PHASE 2: Strangler-Fig Cutover ==="
  echo ""
  echo "This phase is manual. Follow these steps:"
  echo ""
  echo "BATCH 1 — Low-risk read-only hooks (48h shadow, then 24h azure):"
  echo "  setMigrationFlag('useHemsData', 'shadow')"
  echo "  setMigrationFlag('useConfig', 'shadow')"
  echo "  setMigrationFlag('useDownloads', 'shadow')"
  echo "  setMigrationFlag('useNotams', 'shadow')"
  echo "  setMigrationFlag('useProfiles', 'shadow')"
  echo "  setMigrationFlag('useLivePilots', 'shadow')"
  echo "  → Deploy. Monitor Application Insights for 48h."
  echo "  → If discrepancy rate < 0.1%, switch each to 'azure'."
  echo "  → Monitor for 24h. If error rate > 1.5x baseline, rollback to 'supabase'."
  echo ""
  echo "BATCH 2 — Mission and community hooks:"
  echo "  setMigrationFlag('useMissions', 'shadow')"
  echo "  setMigrationFlag('useMissionLogs', 'shadow')"
  echo "  setMigrationFlag('useCommunityPosts', 'shadow')"
  echo "  setMigrationFlag('useIncidentReports', 'shadow')"
  echo "  setMigrationFlag('useAchievements', 'shadow')"
  echo "  → Same 48h shadow + 24h azure pattern."
  echo ""
  echo "BATCH 3 — Management and auth hooks:"
  echo "  setMigrationFlag('useHospitalManagement', 'shadow')"
  echo "  setMigrationFlag('useHelicopterManagement', 'shadow')"
  echo "  setMigrationFlag('useUserRole', 'shadow')"
  echo "  → Same pattern."
  echo ""
  echo "ROLLBACK: setMigrationFlag('hookName', 'supabase') — takes effect immediately."
  echo ""
  echo "Once ALL hooks are on 'azure' with < 0.1% discrepancy:"
  echo "  Run 'bash infra/scripts/cutover-runbook.sh phase3'"
  ;;

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3: Cleanup
# ─────────────────────────────────────────────────────────────────────────────
phase3)
  echo "=== PHASE 3: Supabase Cleanup ==="
  echo ""
  read -p "All hooks confirmed on Azure? This removes Supabase code. (y/N) " confirm
  if [[ "$confirm" != "y" ]]; then echo "Aborted."; exit 1; fi

  bash infra/scripts/cleanup-supabase.sh
  echo ""
  echo "=== PHASE 3 COMPLETE ==="
  echo "Migration finished. Rotate/disable Supabase project credentials."
  ;;

*)
  echo "HEMS Ops Center — Azure Migration Cutover Runbook"
  echo ""
  echo "Usage: bash infra/scripts/cutover-runbook.sh [phase1|phase2|phase3]"
  echo ""
  echo "  phase1  — Data migration (PostgreSQL + Storage)"
  echo "  phase2  — Strangler-fig cutover (shadow → azure)"
  echo "  phase3  — Cleanup (remove Supabase code and dependencies)"
  ;;

esac
