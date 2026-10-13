[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$generator = Join-Path $PSScriptRoot '.preview-tools/package-list-action'
$output = Join-Path $PSScriptRoot '.preview'

if (-not (Test-Path "$generator/PackageBuilder/PackageBuilder.csproj")) {
    & git clone --depth 1 https://github.com/vrchat-community/package-list-action.git $generator
    if ($LASTEXITCODE -ne 0) { throw 'Could not download the listing generator.' }
}

& dotnet run --project "$generator/PackageBuilder/PackageBuilder.csproj" --framework net8.0 -- `
    BuildMultiPackageListing --host Terminal --root $generator `
    --package-listing-source-folder $PSScriptRoot --list-publish-directory $output
if ($LASTEXITCODE -ne 0) { throw 'Listing build failed.' }

Copy-Item -LiteralPath "$output/index.json" -Destination "$PSScriptRoot/public/index.json"
Write-Host 'Updated public/index.json. Refresh the browser to load the new package data.'
