# Memasang folder AI ke proyek Next.js-mu.
# Jalankan dari folder paket ini:
#   powershell -ExecutionPolicy Bypass -File .\pasang.ps1 -Project "D:\path\ke\proyek"
param([Parameter(Mandatory = $true)][string]$Project)

$src = $PSScriptRoot
if (-not (Test-Path (Join-Path $Project "package.json"))) {
  Write-Host "package.json tidak ditemukan di $Project. Periksa path proyek." -ForegroundColor Red
  exit 1
}
if (Test-Path (Join-Path $Project "lib\ai.ts")) {
  Write-Host "PERINGATAN: ada file lib\ai.ts. Itu bentrok dengan folder lib\ai\. Ganti namanya dulu (mis. lib\mock\learning.ts)." -ForegroundColor Yellow
}

New-Item -ItemType Directory -Force -Path (Join-Path $Project "lib\ai") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Project "app\api\ai") | Out-Null
Copy-Item (Join-Path $src "lib\ai\*") (Join-Path $Project "lib\ai") -Recurse -Force
Copy-Item (Join-Path $src "app\api\ai\*") (Join-Path $Project "app\api\ai") -Recurse -Force
Copy-Item (Join-Path $src ".env.example") (Join-Path $Project ".env.example") -Force

$envLocal = Join-Path $Project ".env.local"
if (-not (Test-Path $envLocal)) {
  Copy-Item (Join-Path $src ".env.example") $envLocal
  Write-Host "Dibuat .env.local. ISI GEMINI_API_KEY di dalamnya." -ForegroundColor Cyan
} else {
  Write-Host ".env.local sudah ada, tidak diubah. Pastikan variabel AI ada (lihat .env.example)." -ForegroundColor Cyan
}

$gi = Join-Path $Project ".gitignore"
$content = ""
if (Test-Path $gi) { $content = Get-Content $gi -Raw }
if ($content -and -not $content.EndsWith("`n")) { Add-Content $gi "" }
foreach ($line in @(".env*.local", ".data/")) {
  if ($content -notmatch [regex]::Escape($line)) { Add-Content $gi $line }
}

Write-Host "Selesai. Berikutnya: isi GEMINI_API_KEY, jalankan npm run build, lalu uji (README-AI.md)." -ForegroundColor Green
