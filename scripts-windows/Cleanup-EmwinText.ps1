Import-Module "$PSScriptRoot\Functions.psm1"
$config = Get-Config

$yesterday = $(Get-Date).AddDays(-1)
$yesterdayEmwinText = Get-ChildItem -Attributes !Directory -Recurse "$($config.emwinSrcDir)\*$($yesterday.ToString("yyyyMMdd"))*.TXT"
Compress-Archive -Path $yesterdayEmwinText -DestinationPath "$($config.emwinSrcDir)\$($yesterday.ToString("yyyy-MM-dd")).zip"
foreach($file in $yesterdayEmwinText)
{
    Remove-Item $file.FullName -Force | Out-Null
}