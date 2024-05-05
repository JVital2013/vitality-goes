# Additional Scripts

Vitality GOES comes with a number of scripts to enhance and extend its functionality. All of these scripts are optional, but `Cleanup-EmwinText` is highly recommended since it keeps your EMWIN folder from getting too full.

*Included scripts are for GOES-16/18 HRIT data only*

**To get started,** copy `scriptconfig.ini` from the sample config folder you're using into the `scripts-*/` folder you're using. Then, update all pertinent values. See each script's documentation for what's needed. Unlike the ini files for Vitality GOES itself, you need to make sure there are no spaces around the equal sign (=). Also, comments should start with a #.

Scripts for Linux hosts and are included in the [scripts-linux/](/scripts-linux/) folder, while scripts for Windows are in [/scripts-windows/](/scripts-windows/). See below for each scripts' compatibility matrix and dependencies.

## Timelapse scripts

### CreateVideos-ABI-*

|           | Windows         | Linux         |
|-----------|-----------------|---------------|
| SatDump   | *Supported*     | **Supported** |
| Goestools | *Not Supported* | **Supported** |

**Additional required Linux system packages:**
ffmpeg, imagemagick

**Additional required Windows programs:**
ffmpeg

**Set in scriptconfig.ini before running:**  
`videoDir`, `abiSrcDir`, `abiImgSource`, and `abiVidName`.

- Additionally, `abiImgFilter` is required for SatDump.
- Windows users must set `ffmpegBinary` to the full path of ffmpeg.exe (including the exe name) if ffmpeg.exe is not in their PATH.

CreateVideos-ABI creates timelapse videos of ABI image products. Timelapses are rendered at 15 frames a second from midnight 1 week ago to midnight last night "satellite time". Videos are stored in `videoDir`, which should be the `videos/` folder of Vitality GOES so they can be viewed in the web client.

To setup this script, it's important to understand how the `abiImgSource`, `abiImgFilter`, and `abiVidName` variables interact with each other. These variables are arrays, and each of the arrays are "lined up" with each other. For example, the first element in `abiImgSource` and `abiVidName` are the configs for the first video. The second element of each array is the config for the next video, the third element of each array is the config for the third video, and so on.

* `abiImgSource`: Specifies the source of the frames for each video. This should be similar to [`path` in your abi.ini, meso.ini, and l2.ini config files](config.md#abiini-mesoini-and-l2ini), but make sure to match the synax to the example provided in scriptconfig.ini.
* `abiImgFilter`: (SatDump Only): Specifies the specific files within the source to use for the videos. Should be similar to `filter` in your abi.ini and  meso.ini files.
* `abiVidName`: Specifies the name of the MP4 you want to create, without the MP4 extension. Other than the missing extension, this should match the [`videoPath` in your abi.ini, meso.ini, and l2.ini config files](config.md#abiini-mesoini-and-l2ini)

---

### CreateVideos-EMWIN

|           | Windows     | Linux         |
|-----------|-------------|---------------|
| SatDump   | *Supported* | **Supported** |
| Goestools | *Supported* | **Supported** |

**Additional required Windows/Linux Programs:**
ffmpeg

**Set in scriptconfig.ini before running:**  
`videoDir`, `emwinSrcDir`, `emwinCodeName`, and `emwinVideoName`

- Windows users must set `ffmpegBinary` to the full path of ffmpeg.exe (including the exe name) if ffmpeg.exe is not in their PATH.

CreateVideos-EMWIN creates timelapse videos of EMWIN image products. Timelapses are rendered at 15 frames a second from 1 week ago to the most recent image. Videos are stored in `videoDir`, which should be the `videos/` folder of Vitality GOES so they can be viewed in the web client.

To setup this script, it's important to understand how the `emwinCodeName` and `emwinVideoName` variables interact with each other. These variables are arrays, and each of the arrays are "lined up" with each other. For example, the first element in `emwinCodeName` and `emwinVideoName` are the configs for the first video. The second element of each array is the config for the next video, the third element of each array is the config for the third video, and so on.

* `emwinCodeName`: Specifies the EMWIN file name of the frames for each video. This should be similar to [`path` in your emwin.ini config file](config.md#emwinini), just without the file extension
* `emwinVideoName`: Specifies the name of the MP4 you want to create, without the MP4 extension. Other than the missing extension, this should match the [`videoPath` in your emwin.ini config files](config.md#emwinini).

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
`sanchezSrcPath16`, `sanchezSrcPath18`, `sanchezDstPath16`, `sanchezDstPath18`, `dstPathComposite`, and `sanchezPath`

Sanchez.sh is a script that automates Sanchez renders of your geostationary captures. The first time this script runs, it will automatically download 13 images to use as an underlay: one for each month, and a night time image with city lights. After the first run, the script will function without internet. You can also manually download the necessary images and save them in the Resources folder with the correct name, found in the same directory as Sanchez.sh.

The script reads Channel 13 imagery from `sanchezSrcPath16` and `sanchezSrcPath18`. Then, it creates false-color imagery of GOES-16, GOES-18, and composites. Images are saved in the respective `sanchesDst*` directory.

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
