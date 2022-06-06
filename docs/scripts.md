# Additional Scripts

Vitality GOES comes with a number of scripts to enhance and extend its functionality.

It is optional to implement any of these scripts, but some like Cleanup-EmwinText are highly encouraged. Others, like the video creation scripts, are a bit hacky and could use some touch-ups. But hey, they work great for me!

All scripts are in the `scripts/` folder of this repo.

## Cleanup-EmwinText.sh
* *Additional required system packages: `zip`*
* *Modify line 4 before running: `cd /path/to/goestoolsrepo/emwin`*

When goesproc is configured to save EMWIN text information, it saves *a lot* of text files - roughly 30,000 a day! While these files probably won't fill up your hard drive, they will slow everything down due to the number of files that need to be parsed.

Cleanup-EmwinText.sh solves the problem by compressing all of yesterday's EMWIN text files into a ZIP folder. This script should be configured to run every day between 1600-2330 UTC.

## CreateVideos-ABI.sh
* *Additional required system packages: `ffmpeg imagemagick`*
* *Modify lines 2-6 before running, which set the `srcDir`, `videoDir`, `imgSource`, `vidName`, and `resizeMode` variables*

CreateVideos-ABI.sh creates timelapse videos of ABI image products. By default, they render timelapses of the last week at 15 frames per second.
