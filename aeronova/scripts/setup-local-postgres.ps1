param(
  [string]$Database = "aeronova",
  [string]$HostName = "localhost",
  [int]$Port = 5432,
  [string]$PostgresBin = "C:\Program Files\PostgreSQL\18\bin"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$serverEnv = Join-Path $root "server\.env"
$clientEnv = Join-Path $root "client\.env"
$psql = Join-Path $PostgresBin "psql.exe"

if (-not (Test-Path $psql)) {
  throw "psql.exe was not found at $psql. Pass -PostgresBin with your PostgreSQL bin folder."
}

$userName = Read-Host "Postgres user (press Enter for postgres)"
if ([string]::IsNullOrWhiteSpace($userName)) {
  $userName = "postgres"
}

$securePassword = Read-Host "Postgres password" -AsSecureString
$passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr)
}

$env:PGPASSWORD = $password

Write-Host "Testing PostgreSQL connection..."
& $psql -h $HostName -p $Port -U $userName -d postgres -w -tAc "SELECT 1;" | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Could not connect to PostgreSQL. Check username, password, host, and port."
}

$safeDbName = $Database.Replace("'", "''")
$exists = & $psql -h $HostName -p $Port -U $userName -d postgres -w -tAc "SELECT 1 FROM pg_database WHERE datname = '$safeDbName';"
if (($exists | Out-String).Trim() -eq "1") {
  Write-Host "Database '$Database' already exists."
} else {
  $quotedDbName = '"' + $Database.Replace('"', '""') + '"'
  Write-Host "Creating database '$Database'..."
  & $psql -h $HostName -p $Port -U $userName -d postgres -w -c "CREATE DATABASE $quotedDbName;" | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Could not create database '$Database'."
  }
}

$encodedUser = [Uri]::EscapeDataString($userName)
$encodedPassword = [Uri]::EscapeDataString($password)
$encodedDatabase = [Uri]::EscapeDataString($Database)
$databaseUrl = "postgresql://{0}:{1}@{2}:{3}/{4}?schema=public" -f $encodedUser, $encodedPassword, $HostName, $Port, $encodedDatabase

Set-Content -Path $serverEnv -Encoding utf8 -Value @(
  "DATABASE_URL=`"$databaseUrl`"",
  "PORT=4000",
  "CLIENT_URL=`"http://localhost:5173`""
)

Set-Content -Path $clientEnv -Encoding utf8 -Value @(
  "VITE_API_URL=`"http://localhost:4000/api`""
)

Write-Host "Wrote server/.env and client/.env."
Write-Host "Pushing Prisma schema..."
Push-Location $root
try {
  npm run db:generate
  npm run db:push
  npm run db:seed
} finally {
  Pop-Location
}

Write-Host "AeroNova local PostgreSQL setup complete."
