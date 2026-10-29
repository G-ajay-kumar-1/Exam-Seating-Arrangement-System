$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot 'server\.env'

if (-not (Test-Path $envPath)) {
  throw "Missing server\.env. Create it from server\.env.example before starting the app."
}

$uriLine = Get-Content $envPath | Where-Object { $_ -match '^MONGODB_URI=' } | Select-Object -First 1
if (-not $uriLine) {
  throw "MONGODB_URI is missing from server\.env."
}

$mongoUri = $uriLine.Substring('MONGODB_URI='.Length).Trim().Trim('"').Trim("'")
$localUri = [regex]::Match(
  $mongoUri,
  '^mongodb://(?:[^@/]+@)?(?<host>localhost|127\.0\.0\.1)(?::(?<port>\d+))?(?:[/?]|$)'
)

if (-not $localUri.Success) {
  Write-Host 'Using a non-local MongoDB URI; the backend health check will verify its connection.'
  exit 0
}

$mongoHost = $localUri.Groups['host'].Value
$mongoPort = 27017
if ($localUri.Groups['port'].Success) {
  $mongoPort = [int]$localUri.Groups['port'].Value
}

function Test-MongoPort {
  return [bool](Test-NetConnection `
    -ComputerName $mongoHost `
    -Port $mongoPort `
    -InformationLevel Quiet `
    -WarningAction SilentlyContinue `
    -ErrorAction SilentlyContinue)
}

if (-not (Test-MongoPort)) {
  $mongoServices = @(
    Get-Service | Where-Object {
      $_.Name -match 'mongo' -or $_.DisplayName -match 'mongo'
    }
  )

  if ($mongoServices.Count -ne 1) {
    throw "MongoDB is not listening on ${mongoHost}:$mongoPort and a unique MongoDB Windows service was not found. Start MongoDB or set MONGODB_URI in server\.env to a reachable MongoDB URI."
  }

  if ($mongoServices[0].Status -ne 'Running') {
    Write-Host "Starting MongoDB Windows service '$($mongoServices[0].Name)'..."
    Start-Service -Name $mongoServices[0].Name
  }
}

$deadline = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $deadline) {
  if (Test-MongoPort) {
    Write-Host "MongoDB is accepting connections at ${mongoHost}:$mongoPort."
    exit 0
  }
  Start-Sleep -Seconds 1
}

throw "MongoDB did not start listening on ${mongoHost}:$mongoPort within 60 seconds. Check the MongoDB Windows service and run PowerShell as Administrator if required."
