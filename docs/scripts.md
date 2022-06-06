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

CreateVideos-ABI.sh creates timelapse videos of ABI image products. By default, they render timelapses of the last week at 15 frames per second. Videos are stored in the `html/videos` folder of Vitality GOES so they can be viewed in the web client.

To setup this script, it's important to understand how the `imgSource`, `vidName`, and `resizeMode` variables interact with each other. These variables are arrays, and each of the arrays are "lined up" with each other. For example, the first element in `imgSource`, `vidName`, and `resizeMode` are the configs for the first video. The second element of each array is the config for the next video, the third element of each array is the config for the third video, and so on.

* `imgSrc`: Specifies the source of the frames for each video. This should be similar to [`path` in your abi.ini, meso.ini, and l2.ini config files](config.md#abiini-mesoini-and-l2ini)
* `vidName`: Specifies the name of the MP4 you want to create, without the MP4 extension. Other than the missing extension, this should match the [`videoPath` in your abi.ini, meso.ini, and l2.ini config files](config.md#abiini-mesoini-and-l2ini)
* `resizeMode`: Since the GOES satellites can send very high resolution images, you want to downscale some of them. Resize mode specifies how to resize the images before rendering them into videos:
  * 0: Resize images to 1356x1356. Good for full-disk images
  * 1: Resize images to 1000x1000. Good for some Level-II Non-CMIP Images and Mesoscale images
  * 2: Resize images to 1402x954. Good for Sanchez composites
  * 3: Do not resize the image. 
