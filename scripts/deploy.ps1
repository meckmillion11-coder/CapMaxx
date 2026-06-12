# CapMaxx production deploy helper (run from repo root after `npx vercel login`)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path .env.local)) {
  Write-Error ".env.local missing. Create it with Supabase keys before deploying."
}

Write-Host "Setting Vercel env vars from .env.local..."
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '^([^=]+)=(.*)$') { return }
  $name = $matches[1].Trim()
  $value = $matches[2].Trim()
  foreach ($target in @("production", "preview", "development")) {
    Write-Host "  $name -> $target"
    $value | npx --yes vercel@latest env add $name $target --yes 2>$null
  }
}

Write-Host "Deploying to production..."
npx --yes vercel@latest --prod --yes

Write-Host "Done. Set Supabase Auth Site URL + redirect URLs to your new *.vercel.app URL."
