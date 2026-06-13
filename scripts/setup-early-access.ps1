# CapMaxx Early Access setup — run from repo root
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== CapMaxx Early Access Setup ===" -ForegroundColor Cyan

if (-not (Test-Path .env.local)) {
  Write-Error ".env.local missing."
}

if (-not (Select-String -Path .env.local -Pattern "NEXT_PUBLIC_PRE_LAUNCH=true" -Quiet)) {
  Add-Content .env.local "`nNEXT_PUBLIC_PRE_LAUNCH=true"
  Write-Host "Added NEXT_PUBLIC_PRE_LAUNCH=true to .env.local"
}

Write-Host "`n[1/3] Applying Supabase migration (if SUPABASE_DB_URL is set)..."
node scripts/apply-intake-migration.mjs
if ($LASTEXITCODE -ne 0) {
  Write-Host "Migration skipped or failed. You can run SQL manually in Supabase:" -ForegroundColor Yellow
  Write-Host "  https://supabase.com/dashboard/project/xwwxtnqikkxqukcpitzv/sql/new" -ForegroundColor Yellow
  Write-Host "  Paste: supabase/migrations/0004_intake_early_access.sql" -ForegroundColor Yellow
  Write-Host "  (Intake still works via legacy fallback until migration runs.)" -ForegroundColor Yellow
}

Write-Host "`n[2/3] Syncing env vars to Vercel..."
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '^([^=]+)=(.*)$') { return }
  $name = $matches[1].Trim()
  $value = $matches[2].Trim()
  foreach ($target in @("production", "preview", "development")) {
    Write-Host "  $name -> $target"
    $value | npx --yes vercel@latest env add $name $target --force --yes 2>$null
  }
}

Write-Host "`n[3/3] Deploying to production..."
npx --yes vercel@latest --prod --yes

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "Share with friends: https://capmaxx.vercel.app/founding-companies"
Write-Host "Admin review:     https://capmaxx.vercel.app/admin (sign in as admin)"
