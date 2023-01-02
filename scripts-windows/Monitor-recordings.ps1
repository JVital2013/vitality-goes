Import-Module "$PSScriptRoot\Functions.psm1"
$config = Get-Config

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.IncludeSubdirectories = $true
$watcher.Path = $config.abiSrcDir
$watcher.EnableRaisingEvents = $true

$action = {
    $path = $event.SourceEventArgs.FullPath
    Write-Host "[$(Get-Date -Format G)] $path"
}

Register-ObjectEvent $watcher 'Created' -Action $action | Out-Null
while ($true) {sleep 5}