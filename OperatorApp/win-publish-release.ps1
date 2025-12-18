Write-Host "[1/8] Read major/minor from version.json..."

$versionPath = Join-Path $PSScriptRoot "..\version.json"

if (-not (Test-Path $versionPath)) {
    Write-Error "version.json not found at $versionPath"
    exit 1
}

$version = Get-Content -Raw $versionPath | ConvertFrom-Json

$Major = $version.major
$Minor = $version.minor

Write-Host "Major version: $Major"
Write-Host "Minor version: $Minor"


Write-Host "[2/8] Decide DEV vs CI..."

if ($env:GITHUB_ACTIONS -eq "true") {
    Write-Host "CI build detected"

    if (-not $env:PATCH) {
        Write-Error "PATCH not set in CI"
        exit 1
    }

    $Patch = $env:PATCH
    Write-Host "Using PATCH from CI: $Patch"
}
else {
    Write-Host "Local DEV build detected will be performed with -1 patch"
    $Patch = "0"
}

Write-Host "[3/8] Compose version numbers (Windows requires numeric-only 4 placeholders version number)..."

$Version = "$Major.$Minor.$Patch.0"
Write-Host "Version: $Version"

Write-Host "[4/8] Building Angular ..."

Push-Location Frontend

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed!"
    if (-not $env:GITHUB_ACTIONS) {
        Read-Host "Press Enter to exit"
    }
    exit $LASTEXITCODE
}

ng build --configuration production
if ($LASTEXITCODE -ne 0) {
    Write-Error "Angular build failed!"
    if (-not $env:GITHUB_ACTIONS) {
        Read-Host "Press Enter to exit"
    }
    exit $LASTEXITCODE
}

Pop-Location

Write-Host "[5/8] Copying Angular build to Backend\wwwroot..."

$wwwrootPath = Join-Path $PSScriptRoot "Backend\wwwroot"
$sourcePath  = Join-Path $PSScriptRoot "Frontend\dist\frontend\browser"

if (Test-Path $wwwrootPath) {
    Remove-Item $wwwrootPath -Recurse -Force
}

New-Item -ItemType Directory -Path $wwwrootPath | Out-Null

Copy-Item `
    -Path (Join-Path $sourcePath "*") `
    -Destination $wwwrootPath `
    -Recurse `
    -Force

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to copy Angular build to Backend\wwwroot!"
    if (-not $env:GITHUB_ACTIONS) {
        Read-Host "Press Enter to exit"
    }
    exit 1
}


Write-Host "[6/8] Publishing Backend (Release)..."

dotnet publish Backend/Backend.csproj `
    -c Release `
    -r win-x64 `
    --self-contained `
    -o TempPublish\Backend

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend publish failed!"
    if (-not $env:GITHUB_ACTIONS) {
        Read-Host "Press Enter to exit"
    }
    exit $LASTEXITCODE
}

Write-Host "[7/8] Publishing CalibrixOperatorWin (Release)..."

dotnet publish DesktopHost/DesktopHost.csproj `
    -c Release `
    -r win-x64 `
    --self-contained `
    -o Publish `
    -p:Version=$Version `


if ($LASTEXITCODE -ne 0) {
    Write-Error "CalibrixOperatorWin publish failed!"
    if (-not $env:GITHUB_ACTIONS) {
        Read-Host "Press Enter to exit"
    }
    exit $LASTEXITCODE
}


Write-Host "[8/8] Moving Backend into Publish\Backend..."

$sourcePath      = Join-Path $PSScriptRoot "TempPublish\Backend"
$destinationPath = Join-Path $PSScriptRoot "Publish\Backend"

try {
    if (Test-Path $destinationPath) {
        Remove-Item $destinationPath -Recurse -Force -ErrorAction Stop
    }

    New-Item -ItemType Directory -Path $destinationPath -ErrorAction Stop | Out-Null

    Copy-Item `
        -Path (Join-Path $sourcePath "*") `
        -Destination $destinationPath `
        -Recurse `
        -Force `
        -ErrorAction Stop
}
catch {
    Write-Error "Failed to copy Backend into Publish!"
    Write-Error $_
    if (-not $env:GITHUB_ACTIONS) {
        Read-Host "Press Enter to exit"
    }
    exit 1
}


Write-Host "Cleaning up temporary Backend publish folder..."
$tempPublishPath = Join-Path $PSScriptRoot "TempPublish"

if (Test-Path $tempPublishPath) {
    Remove-Item $tempPublishPath -Recurse -Force
}


Write-Host "Publish complete! Ready to distribute:"
Write-Host "Publish\CalibrixOperatorWin.exe"
if (-not $env:GITHUB_ACTIONS) {
    Read-Host "Press Enter to exit"
}
