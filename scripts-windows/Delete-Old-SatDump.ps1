Import-Module "$PSScriptRoot\Functions.psm1"
$config = Get-Config

$twoWeeksAgo = $(Get-Date).AddDays(-14).ToUniversalTime()
$twoWeeksAgoString = $twoWeeksAgo.ToString("yyyyMMddHms")
$twoWeeksAgoL2 = "s" + $twoWeeksAgo.ToString("yyyy") + $twoWeeksAgo.DayOfYear.ToString("000") + $twoWeeksAgo.ToString("Hms") + 0

#NWS
$files = Get-ChildItem -Attributes !Directory -Recurse "$($config.abiSrcDir)\IMAGES\NWS"
foreach($file in $files)
{
    $datestr = $file.BaseName.Split("-")[0]
    if($datestr -lt $twoWeeksAgoString)
    {
        Write-Output "[$(Get-Date -Format G)] Deleting $($file.FullName)..."
        Remove-Item $file.FullName -Force | Out-Null
    }
}

#EMWIN
$files = Get-ChildItem -Attributes !Directory -Recurse $config.emwinSrcDir
foreach($file in $files)
{
    if($file.Extension -eq ".zip") {continue}

    $datestr = $file.BaseName.Split('_')[4]
    if($datestr -lt $twoWeeksAgoString)
    {
        Write-Output "[$(Get-Date -Format G)] Deleting $($file.FullName)..."
        Remove-Item $file.FullName -Force | Out-Null
    }
}

#ABI Imagery
$files = Get-ChildItem -Attributes Directory -Recurse -Filter "****-**-**_**-**-**" "$($config.abiSrcDir)\IMAGES\"
foreach($file in $files)
{
    $datestr = $file.Name.Replace("_", "").Replace("-", "")
    if($datestr -lt $twoWeeksAgoString)
    {
        Write-Output "[$(Get-Date -Format G)] Deleting $($file.FullName)..."
        Remove-Item $file.FullName -Recurse -Force | Out-Null
    }
}

#L2 Imagery
$files = Get-ChildItem -Attributes !Directory "$($config.abiSrcDir)\IMAGES\Unknown"
foreach($file in $files)
{
    $datestr = $file.BaseName.Split('_')[3]
    if($datestr -lt $twoWeeksAgoL2)
    {
        Write-Output "[$(Get-Date -Format G)] Deleting $($file.FullName)..."
        Remove-Item $file.FullName -Force | Out-Null
    }
}
