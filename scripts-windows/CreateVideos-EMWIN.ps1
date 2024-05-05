Import-Module "$PSScriptRoot\Functions.psm1"
$config = Get-Config

#Validate we have the necessary programs
if($config.ContainsKey("ffmpegBinary"))
{
    $ffmpeg = $config.ffmpegBinary
}
elseif($(get-command ffmpeg.exe -ErrorAction SilentlyContinue).Count -gt 0)
{
    $ffmpeg = "ffmpeg.exe"
}
else
{
    Write-Error "ffmpeg not found! Either put it in your system PATH, or configure ffmpegBinary in scriptconfig.ini"
    exit
}

if($config.emwinCodeName.Count -ne $config.emwinVideoName.Count)
{
    Write-Error "emwinCodeName and emwinVideoName must have the same number of elements in scriptconfig.ini"
	exit
}

$oneWeekAgoString = $(Get-Date).AddDays(-7).ToUniversalTime().ToString("yyyyMMddHms")

for($i = 0; $i -lt $config.emwinCodeName.Count; $i++)
{
    $thisVidName = $($config.emwinVideoName[$i].Trim('"'))
    Write-Output "[$(Get-Date -Format "G")] Gathering images for $thisVidName..."
    Remove-Item -Force $env:TEMP\emwin.txt -ErrorAction SilentlyContinue | Out-Null

    $imageFiles = Get-ChildItem -Recurse -Attributes !Directory -Filter "*$($config.emwinCodeName[$i].Trim('"'))*" $config.emwinSrcDir | where {$_.Name.Split("_")[4] -gt $oneWeekAgoString} | Sort-Object {$_.Name.Split("_")[4]}
    if($imageFiles.Count -gt 0)
    {
        Write-Output "[$(Get-Date -Format "G")] Rendering video..."
        foreach($imageFile in $imageFiles)
        {
            Add-Content -Path $env:TEMP\emwin.txt -Value "file '$($imageFile.FullName)'"
            Add-Content -Path $env:TEMP\emwin.txt -Value "duration 0.0666667"
        }
        Remove-Item "$($config.videoDir)\$thisVidName.mp4" -Force -ErrorAction SilentlyContinue | Out-Null
        & $ffmpeg -hide_banner -loglevel error -f concat -safe 0 -i $env:TEMP\emwin.txt -c:v libx264 -crf 20 -pix_fmt yuv420p -vf pad="width=ceil(iw/2)*2:height=ceil(ih/2)*2" -r 15 "$($config.videoDir)/$thisVidName.mp4"
    }
    else
    {
        Write-Output "[$(Get-Date -Format "G")] No images for $thisVidName, skipping"
    }
}

Remove-Item -Force $env:TEMP\emwin.txt -ErrorAction SilentlyContinue | Out-Null