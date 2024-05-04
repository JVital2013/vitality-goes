Add-Type -AssemblyName System.Drawing
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

if($config.abiImgSource.Count -ne $config.abiImgFilter.Count -or $config.abiImgSource.Count -ne $config.abiVidName.Count)
{
    Write-Error "abiImgSource, abiVidName, and abiImgFilter must have the same number of elements in scriptconfig.ini"
	exit
}

$oneWeekAgo = $(Get-Date).AddDays(-7).ToUniversalTime()
$oneWeekAgoString = $oneWeekAgo.ToString("yyyyMMdd")
$oneWeekAgoString += "040000"
$endTimeString = $(Get-Date).ToUniversalTime().ToString("yyyyMMdd")
$endTimeString += "035959"

for($i = 0; $i -lt $config.abiImgSource.Count; $i++)
{
    $thisVidName = $($config.abiVidName[$i].Trim('"'))
    Write-Output "[$(Get-Date -Format "G")] Gathering images for $thisVidName..."
    Remove-Item -Recurse -Force $env:TEMP\abi -ErrorAction SilentlyContinue | Out-Null
    mkdir $env:TEMP\abi | Out-Null

    $thisSourceDir = $config.abiImgSource[$i].Replace('$abiSrcDir', $config.abiSrcDir).Trim("`"")
    $imageFiles = Get-ChildItem -Recurse -Attributes !Directory -Filter "*$($config.abiImgFilter[$i].Trim('"'))*" $thisSourceDir
    $j = 0
    foreach($imageFile in $imageFiles)
    {
        $datestr = $imageFile.Directory.Name.ToString().Replace("_", "").Replace("-", "")
        if($datestr -lt $oneWeekAgoString -or $datestr -gt $endTimeString) { continue }

        #Check if the image is small enough
        $imageData = [System.Drawing.Image]::FromFile($imageFile.FullName)
        $resizeNeeded = $false
        $resizeX = $imageData.Width
        $resizeY = $imageData.Height
        while($resizeX -gt 1500)
        {
            $resizeNeeded = $true
            $resizeX /= 2
            $resizeY /= 2
        }

        #Resize and save, or copy, depending on original size
        if($resizeNeeded -eq $true)
        {
            $resizedImage = New-Object System.Drawing.Bitmap($imageData, $('{0},{1}' -f $resizeX, $resizeY))
            $resizedImage.Save("$($env:TEMP)\abi\image$($j.ToString("000")).png", [System.Drawing.Imaging.ImageFormat]::Png)
        }
        else
        {
            $imageData.Save("$($env:TEMP)\abi\image$($j.ToString("000")).png", [System.Drawing.Imaging.ImageFormat]::Png)
        }

        $j++ | Out-Null
    }

    if($j -gt 0)
    {
        Write-Output "[$(Get-Date -Format "G")] Rendering video..."
        Remove-Item "$($config.videoDir)\$thisVidName.mp4" -Force -ErrorAction SilentlyContinue | Out-Null
        & $ffmpeg -hide_banner -loglevel error -framerate 15 -i "$($env:TEMP)\abi\image%03d.png" -vf 'pad=width=ceil(iw/2)*2:height=ceil(ih/2)*2,minterpolate=fps=60:mi_mode=blend:me_mode=bidir:mc_mode=obmc:me=ds:vsbmc=1' -c:v libx264 -crf 20 -pix_fmt yuv420p "$($config.videoDir)\$thisVidName.mp4"
    }
    else
    {
        Write-Output "[$(Get-Date -Format "G")] No images for $thisVidName, skipping"
    }
}

Remove-Item -Recurse -Force $env:TEMP\abi -ErrorAction SilentlyContinue | Out-Null
mkdir $env:TEMP\abi | Out-Null