#!/usr/bin/env bash
# =============================================================================
# HEMS Ops Center — Supabase Cleanup Script
# =============================================================================
# Removes all Supabase dependencies, integration code, and environment
# variables after the Azure migration is fully complete.
#
# Run this ONLY after all hooks are confirmed on Azure (Phase 3).
#
# Usage: bash infra/scripts/cleanup-supabase.sh
# =============================================================================

set -euo pipefail

echo "=== Supabase Cleanup ==="
echo ""

# 1. Remove Supabase integration directory
echo "[1/5] Removing src/integrations/supabase/ ..."
if [ -d "src/integrations/supabase" ]; then
  rm -rf src/integrations/supabase
  echo "  ✓ Removed src/integrations/supabase/"
else
  echo "  ~ Already removed"
fi

# 2. Remove Supabase packages from package.json
echo "[2/5] Removing @supabase packages from package.json ..."
PACKAGES_TO_REMOVE=(
  "@supabase/supabase-js"
  "@supabase/auth-ui-react"
  "@supabase/auth-ui-shared"
)

for pkg in "${PACKAGES_TO_REMOVE[@]}"; do
  if grep -q "\"$pkg\"" package.json 2>/dev/null; then
    # Use node to safely remove from package.json
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      delete pkg.dependencies['$pkg'];
      delete pkg.devDependencies?.['$pkg'];
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    echo "  ✓ Removed $pkg"
  else
    echo "  ~ $pkg not found"
  fi
done

# 3. Remove deprecated Lua script
echo "[3/5] Removing deprecated X-Plane Lua script ..."
if [ -f "public/downloads/hems-dispatch-xp.lua" ]; then
  rm -f public/downloads/hems-dispatch-xp.lua
  echo "  ✓ Removed hems-dispatch-xp.lua"
else
  echo "  ~ Already removed"
fi

# 4. Clean Supabase env vars from .env files
echo "[4/5] Removing SUPABASE_* variables from .env files ..."
for envfile in .env .env.local; do
  if [ -f "$envfile" ]; then
    # Remove lines starting with SUPABASE_
    grep -v "^SUPABASE_" "$envfile" > "${envfile}.tmp" || true
    mv "${envfile}.tmp" "$envfile"
    echo "  ✓ Cleaned $envfile"
  fi
done

# 5. Reinstall dependencies
echo "[5/5] Reinstalling dependencies ..."
npm install
echo "  ✓ Dependencies updated"

echo ""
echo "=== Cleanup Complete ==="
echo ""
echo "Remaining manual steps:"
echo "  1. Remove migrateHookToAzure() wrappers from hooks (if still present)"
echo "  2. Rotate/disable Supabase project credentials in the Supabase dashboard"
echo "  3. Run 'npm run build' to verify the project compiles without Supabase"
echo "  4. Commit and push the cleanup changes"
