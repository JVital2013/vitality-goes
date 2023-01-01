# Additional Scripts

Vitality GOES comes with a number of scripts to enhance and extend its functionality. All of these scripts are optional, but `Cleanup-EmwinText` is highly recommended since it keeps your EMWIN folder from getting too full.

**To get started,** copy `scriptconfig.ini` from the sample config folder you're using into the `scripts-*/` folder you're using. Then, update all pertinent values. See each script's documentation for what's needed. Unlike the ini files for Vitality GOES itself, you need to make sure there are no spaces around the equal sign (=). Also, comments should start with a #.

Scripts for Linux hosts and are included in the [scripts-linux/](/scripts-linux/) folder, while scripts for Windows are in [/scripts-windows/](/scripts-windows/). See below for each scripts' compatibility matrix and dependencies; the Windows scripts have no additional dependencies.

Additional batch files for Windows can be found at [https://usradioguy.com/custom-imagery-scripts-for-goes/](https://usradioguy.com/custom-imagery-scripts-for-goes/). Over there you can find video rendering scripts for Windows, which is currently not available from this project.

## Timelapse scripts

### CreateVideos-ABI

|           | Windows         | Linux           |
|-----------|-----------------|-----------------|
| SatDump   | *Not Supported* | *Not Supported* |
| Goestools | *Not Supported* | **Supported**   |

**Additional required Linux system packages:**  
ffmpeg, imagemagick

**Set in scriptconfig.ini before running:**  
`videoDir`, `abiSrcDir`, `abiImgSource`, and `abiVidName`

CreateVideos-ABI creates timelapse videos of ABI image products. Timelapses are rendered at 15 frames a second from midnight 1 week ago to midnight last night "satellite time". Videos are stored in `videoDir`, which should be the `videos/` folder of Vitality GOES so they can be viewed in the web client.

To setup this script, it's important to understand how the `abiImgSource` and `abiVidName` variables interact with each other. These variables are arrays, and each of the arrays are "lined up" with each other. For example, the first element in `abiImgSource` and `abiVidName` are the configs for the first video. The second element of each array is the config for the next video, the third element of each array is the config for the third video, and so on.

* `abiImgSource`: Specifies the source of the frames for each video. This should be similar to [`path` in your abi.ini, meso.ini, and l2.ini config files](config.md#abiini-mesoini-and-l2ini), but make sure to match the synax to the example provided in scriptconfig.ini.
* `abiVidName`: Specifies the name of the MP4 you want to create, without the MP4 extension. Other than the missing extension, this should match the [`videoPath` in your abi.ini, meso.ini, and l2.ini config files](config.md#abiini-mesoini-and-l2ini)

---

### CreateVideos-EMWIN

|           | Windows         | Linux           |
|-----------|-----------------|-----------------|
| SatDump   | *Not Supported* | **Supported**   |
| Goestools | *Not Supported* | **Supported**   |

**Additional required Linux system packages:**  
ffmpeg

**Set in scriptconfig.ini before running:**  
`videoDir`, `emwinSrcDir`, `emwinCodeName`, `emwinVideoName`, and `emwinFileExt`

CreateVideos-EMWIN creates timelapse videos of EMWIN image products. Timelapses are rendered at 15 frames a second from 1 week ago to the most recent image. Videos are stored in `videoDir`, which should be the `videos/` folder of Vitality GOES so they can be viewed in the web client.

To setup this script, it's important to understand how the `emwinCodeName`, `emwinVideoName`, and `emwinFileExt` variables interact with each other. These variables are arrays, and each of the arrays are "lined up" with each other. For example, the first element in `emwinCodeName`, `emwinVideoName`, and `emwinFileExt` are the configs for the first video. The second element of each array is the config for the next video, the third element of each array is the config for the third video, and so on.

* `emwinCodeName`: Specifies the EMWIN file name of the frames for each video. This should be similar to [`path` in your emwin.ini config file](config.md#emwinini), just without the file extension
* `emwinVideoName`: Specifies the name of the MP4 you want to create, without the MP4 extension. Other than the missing extension, this should match the [`videoPath` in your emwin.ini config files](config.md#emwinini).
* `emwinFileExt`: Specifies the file format of the source frames. This should match the extension of the source frames

## Other Scripts

### Sanchez.sh

|           | Windows         | Linux           |
|-----------|-----------------|-----------------|
| SatDump   | *Not Supported* | *Not Supported* |
| Goestools | *Not Supported* | **Supported**   |

**Additional required Linux system packages:**  
xplanet, imagemagick

**Additional required software (non-system)**  
[Sanchez 1.0.21 or newer](https://github.com/nullpainter/sanchez)

**Set in scriptconfig.ini before running:**  
`sanchezSrcPath16`, `sanchezSrcPath17`, `sanchezSrcPath18`, `sanchezDstPath16`, `sanchezDstPath17`, `sanchezDstPath18`, `dstPathComposite`, and `sanchezPath`

Sanchez.sh is a script that automates Sanchez renders of your geostationary captures. The first time this script runs, it will automatically download 13 images to use as an underlay: one for each month, and a night time image with city lights. After the first run, the script will function without internet. You can also manually download the necessary images and save them in the Resources folder with the correct name, found in the same directory as Sanchez.sh.

The script currently reads Channel 13 imagery is read from `sanchezSrcPath16`, `sanchezSrcPath17`, `sanchezSrcPath18`, Then, it creates 4 things: GOES-16, GOES-17, GOES-18, and composited false color images. Images are saved in the respective `sanchesDst*` directory.

The script will also do any "back" renders that it may have missed due to the script being disabled, failing to run, or other issues. When done, enable the Sanchez sections in your [abi.ini config file](config.md#abiini-mesoini-and-l2ini) to display your fancy new renders.

---

### Cleanup-EmwinText

|           | Windows       | Linux         |
|-----------|---------------|---------------|
| SatDump   | **Supported** | **Supported** |
| Goestools | **Supported** | **Supported** |

**Additional required Linux system packages:**  
zip

**Set in scriptconfig.ini before running:**  
`emwinSrcDir`

When goesproc is configured to save EMWIN text information, it saves *a lot* of text files - roughly 30,000 a day! While these files probably won't fill up your hard drive, they will slow everything down due to the number of files that need to be parsed.

Cleanup-EmwinText solves the problem by compressing all of yesterday's EMWIN text files into a ZIP folder. This script should be configured to run every day between 1600-2330 UTC.

---

### Delete-Old-*

|           | Windows       | Linux         |
|-----------|---------------|---------------|
| SatDump   | **Supported** | **Supported** |
| Goestools | **Supported** | **Supported** |

**Set in scriptconfig.ini before running:**  
`abiSrcDir` and `emwinSrcDir`

Delete-Old-Goestools deletes all ABI, EMWIN, NWS, and admin text files that are older than 2 weeks old. I run this on my ground station manually after I verify my offline archives are up-to-date. This version is for data coming from goestools.

Delete-Old-SatDump is the same as Delete-Old-Goestools, but for data from SatDump. This version does not delete old admin text files since they aren't saved repeatedly, and it will not work for non-GOES satellites!

---

### Monitor-Recordings

|           | Windows       | Linux         |
|-----------|---------------|---------------|
| SatDump   | **Supported** | **Supported** |
| Goestools | **Supported** | **Supported** |

**Additional required Linux system packages:**  
`inotify-tools`

**Set in scriptconfig.ini before running:**  
`abiSrcDir`

Monitor-Recordings file barely constitutes a script, but it can be used to monitor files as they are saved by goestools/SatDump. Both satellite decoders do output this information, but if you're running them as a service, the information is hidden. I find that this script does a good job at verifying that your satellite decoder is actually processing data.

Run manually as needed.

## Sample cron.d file
Linux systems allow you to schedule tasks by creating a file under `/etc/cron.d/` with a list of tasks to execute. Here's how I have my cron file set up, at `/etc/cron.d/goes`:

```
0 0 * * * youruser /path/to/vitality-goes/scripts/CreateVideos-ABI.sh
0 2 * * * youruser /path/to/vitality-goes/scripts/CreateVideos-EMWIN.sh
55 11 * * * youruser /path/to/vitality-goes/scripts/Cleanup-EmwinText.sh
25,55 2-23 * * * youruser /path/to/vitality-goes/scripts/Sanchez.sh
```
