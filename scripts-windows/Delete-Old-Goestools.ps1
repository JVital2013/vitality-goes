Import-Module "$PSScriptRoot\Functions.psm1"
$config = Get-Config

$twoWeeksAgo = $(Get-Date).AddDays(-14).ToUniversalTime()
$twoWeeksAgoABI = $twoWeeksAgo.ToString("yyyyMMddTHmsZ")
$twoWeeksAgoEMWIN = $twoWeeksAgo.ToString("yyyyMMddHms")

#NWS, Text
$files = Get-ChildItem -Attributes !Directory -Recurse "$($config.abiSrcDir)\nws", "$($config.abiSrcDir)\text"
foreach($file in $files)
{
    $datestr = $file.BaseName.Split("_")[0]
    if($datestr -lt $twoWeeksAgoABI)
    {
        Write-Output "[$(Get-Date -Format G)] Deleting $($file.Name)..."
        Remove-Item $file.FullName -Force | Out-Null
    }
}

#EMWIN
$files = Get-ChildItem -Attributes !Directory -Recurse $config.emwinSrcDir
foreach($file in $files)
{
    if($file.Extension -eq ".zip") {continue}

    $datestr = $file.BaseName.Split('_')[4]
    if($datestr -lt $twoWeeksAgoEMWIN)
    {
        Write-Output "[$(Get-Date -Format G)] Deleting $($file.Name)..."
        Remove-Item $file.FullName -Force | Out-Null
    }
}

#ABI Imagery
$files = Get-ChildItem -Attributes !Directory -Recurse "$($config.abiSrcDir)\goes19", "$($config.abiSrcDir)\goes18"
foreach($file in $files)
{
    $datestr = $file.BaseName.Split('_')[-1]
    if($datestr -lt $twoWeeksAgoABI)
    {
        Write-Output "[$(Get-Date -Format G)] Deleting $($file.Name)..."
        Remove-Item $file.FullName -Force | Out-Null
    }
}