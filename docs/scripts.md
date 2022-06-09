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

## CreateVideos-EMWIN.sh
* *Additional required system packages: `ffmpeg imagemagick rename`*
* *Modify lines 2-6 before running, which set the `srcDir`, `videoDir`, `codeName`, `videoName`, and `imgconvert` variables*

CreateVideos-EMWIN.sh creates timelapse videos of EMWIN image products. By default, they render timelapses of the last week at 15 frames per second. Videos are stored in the `html/videos` folder of Vitality GOES so they can be viewed in the web client.

To setup this script, it's important to understand how the `codeName`, `videoName`, and `imgconvert` variables interact with each other. These variables are arrays, and each of the arrays are "lined up" with each other. For example, the first element in `codeName`, `videoName`, and `imgconvert` are the configs for the first video. The second element of each array is the config for the next video, the third element of each array is the config for the third video, and so on.

* `codeName`: Specifies the EMWIN file name of the frames for each video. This should be similar to [`path` in your emwin.ini config file](config.md#emwinini), just without the file extension
* `videoName`: Specifies the name of the MP4 you want to create, without the MP4 extension. Other than the missing extension, this should match the [`videoPath` in your emwin.ini config files](config.md#emwinini).
* `imgconvert`: Specifies the file format of the source frames. This should match the extension of the source frames

## Sanchez.sh
* *Additional required system packages: `xplanet`*
* *Additional required software (non-system): [sanchez](https://github.com/nullpainter/sanchez)*
* *Modify lines 2-7 before running, which set the `srcPath16`, `srcPath17`, `dstPath16`, `dstPath17`, `dstPathComposite`, and `sanchezPath` variables*

Sanchez.sh is a script that automates Sanchez renders of your geostationary captures. To use it, xplanet must first be configred. Install xplanet as you typically would for your distro, and download/extract Sanchez. Next, edit the xplanet default config file (at `/var/share/xplanet/config/config` in most distros). Change the `[earth]` section to only say this:

```ini
[earth]
"Earth"
map=/path/to/sanchez/Resources/world.200411.3x10848x5424.jpg
night_map=/path/to/sanchez/Resources/world.lights.3x10848x5424.jpg
```

The script currently creates 3 things: GOES-16 false color images, GOES-17 false color images, and composites of GOES-16 and 17. The script will also do any "back" renders that it may have missed due to the script being disabled, failing to run, or other issues. This script will need updated once GOES-18 takes the GOES West spot.

When done, enable the Sanchez sections in your [abi.ini config file](config.md#abiini-mesoini-and-l2ini) to display your fancy new renders.

## Delete-Old.sh
*Modify line 2 before running, which sets the location of your GOES files.*

Delete-Old.sh deletes all ABI, EMWIN, NWS, and admin text files that are older than 2 weeks old. I run this on my ground station manually after I verify my offline archives are up-to-date.

## Monitor-Recordings.sh
* *Additional required system package: `inotify-tools`*
* *Modify line 2 to set the location of your GOES files before running

Monitor-Recordings.sh file barely constitutes a script, but it can be used to monitor files as they are saved by goestools. Goesproc does output this information, but if you're running goesproc as a service, the information is hidden. I find that this script does a good job at verifying that goesproc is actually processing data.

Run manually as needed.

# Sample cron.d file
Linux systems allow you to schedule tasks by creating a file under `/etc/cron.d/` with a list of tasks to execute. Here's how I have my cron file set up, at `/etc/cron.d/goes`:

```
0 0 * * * youruser /path/to/vitality-goes/scripts/CreateVideos-ABI.sh
0 5 * * * youruser /path/to/vitality-goes/scripts/CreateVideos-EMWIN.sh
55 11 * * * youruser /path/to/vitality-goes/scripts/Cleanup-EmwinText.sh
25,55 5-23 * * * youruser /path/to/vitality-goes/scripts/Sanchez.sh
```
