# How to Configure Vitality GOES

The primary Vitality GOES config is stored in `html/config`. To get started, copy a set of example configuration files from the [configs folder](/configs) info `html/config`. Configs for using goestools data source are prefixed with "goestools-", while configs for SatDump are prefixed with "satdump-". Scriptconfig.ini is not needed for Vitality GOES itself, so skip it if present.

Configurations are highly customizable and can be modified to fit your configuration as you see fit. The configuration is broken out into the following files:

* **config.ini**: The main configuration file
* **emwin.ini**: Stores information about the emwin images you want to display. This file has no effect on emwin text that is displayed, and does not need changed if you're switching between GOES-16 and 18.
* **abi.ini**: Contains information about your full-disk images. If you're doing any Sanchez renders, I'd put them in this file as well
* **meso.ini**: Contains information about your mesoscale images.
* **l2.ini**: Contains infromation about your ABI Level 2 products. These images contain information about estimated rainfall, land surface temp, sea surface temp, and more. Note that goestools does not receive these unless your goesproc config is set up to do so, and SatDump is currently not supported. The sample goesproc config in this repository is configured correctly, but if you're not saving these files, delete l2.ini.

Any comments must begin with a semicolon (;).

## config.ini

This is the main config file. It will likely need configured when you first deploy Vitality GOES. It is broken out into the following sections:

### General
* `siteTitle`: Sets the title of the Vitality GOES Web App. If not set, the site title defaults to "Vitality GOES"
* `siteTheme`: The theme for Vitality GOES. Leave unset to use the built-in theme, or set it to an installed theme. The included themes are "light", "purple", "red", and "uos". This option can be overridden per-browser by using the "Local Settings" screen. For more on theming, [look here](/docs/themes.md).
* `graphiteAPI`: If you're using goestools and want to view its decoder/demodulator statistcs, this should point to your graphite host. It must include the `/render/` path at the end to work properly. If you're not using goestools/graphite, comment/remove this line. For information on how to set up graphite, [look here](/docs/graphite.md).
* `satdumpAPI`: Points to the SatDump REST API to pull decoder/demodulator statistics. You must run SatDump with the `--http_server` flag to get statistics. If you're not using SatDump or don't want statistics, comment/delete this line.
* `emwinPath`: Point to the emwin repository of your choice. If you're picking up both GOES West and East, you can use either's EMWIN files. Comment/delete this line to completely disable emwin data (text and images), or if you're not picking up data from a GOES satellite.
* `adminPath`: The directory with admin text you want to display. SatDump will save these files out-of-the-box, but goestools must be patched with [this patch for it to show up](https://github.com/pietern/goestools/pull/105/files). Comment/delete this line to disable. For GOES satellites only.
* `showSysInfo`: Set to true if you want to display information about your Vitality GOES server, such as system resource availability and system temps. Set to false to disable.
* `debug`: Set to true to enable PHP errors. This breaks the AJAX requests within Vitality GOES if there are any errors, so only set this to true if you're debugging data returned by the DataHandler (advanced users only).

### Paths
A path should be set up for each satellite downlink you're receiving. Each path defined in this section creates a variable that can be used in the `path` options of your abi, meso, and l2 ini files. One or more satellite should be listed here.

**NOTE:** This does not define the path of the images from a particular satellite, but rather the path for the entire downlink. For example, let's assume you're receiving GOES16, and your images are at `/home/pi/goes/goes16/fd/fc/...`. The `goes16` setting under `[paths]` would be set to `/home/pi/goes` (the parent path for the entire satellite downlink), not `/home/pi/goes/goes16` (the path just for the images from GOES16).

**Example** Let's say you have:
- `GOES16 = /path/to/goestoolsdata` under `[paths]` of your config.ini
- `path = {GOES16}/goes16/fd/fc/` is set under an image handler like `[fdfc_16]` in your abi.ini file

With this configuration, Vitality GOES will expect your images to be at `/path/to/goestoolsdata/goes16/fd/fc/`. Images may be in a dated subfolder.

If hosted on Windows, set your paths to something like `GOES16 = C:\path\to\satdumpdata`

### Location
This section contains information about your physical location. If you're not displaying EMWIN data, the only thing you need to configure is `timezone`. A list of supported timezones can be found [here](https://www.php.net/manual/en/timezones.php).

If you are displaying EMWIN/local weather data, here's what each of the other options mean. Note that these options can also be changed per client web browser by using the "Local Settings" screen in Vitality GOES.

* `radarCode`: The last 5 letters of the radar file for your region. In the emwin directory, all radar files end with RAD{radarCode}.GIF. **The radar image you want to display must be configured as an available image in emwin.ini**
  
  At the time of writing, valid radarCodes are:
  *  ALLAK (Alaska)
  *  ALLGU (Guam)
  *  ALLHU (Hawaii)
  *  ALLPR (Puerto Rico)
  *  ALLUS (All US)
  *  GRTLK (Great Lakes Region)
  *  NTHES (North East Region)
  *  PACNW (Pacific Northwest Region)
  *  PACSW (Pacific Southwest Region)
  *  RCKNT (Nothern Rocky Mountains Region)
  *  RCKST (Southern Rocky Mountains Region)
  *  REFUS (Continental United States)
  *  SMSVY (Southern Mississippi River Valley Region)
  *  STHES (South East Region)
  *  STHPL (Southern Plains Region)
  *  UMSVY (Upper Mississippi Valley)
*  `stateAbbr`: The post office abbreviation of your state. Also includes things like PR for Puerto Rico, AS for American Samoa, etc.
*  `wxZone`: The weather zone of your location. This is typically your state abbreviation, a Z, and a 3 digit number. Example: PAZ066. You can either use the "Local Settings" section of Vitality GOES to figure this out, or use [this site](https://pnwpest.org/cgi-bin/wea3/wea3) to search for your town. "Weather Zone" shows up in the upper-right of that page.
*  `orig`: The National Weather Service Forecast Office for your local weather information. The code needs to be the office call sign, plus the 2-letter state abbreviation. You can either use the "Local Settings" section of Vitality GOES to figure this out, or look at [https://en.wikipedia.org/wiki/List_of_National_Weather_Service_Weather_Forecast_Offices](https://en.wikipedia.org/wiki/List_of_National_Weather_Service_Weather_Forecast_Offices). For example, State College PA is "CTP", so orig needs to be set to `CTPPA`
*  `lat` and `lon`: Your exact latitude and longitude. This is only used to determine if you're within an alert area as issued by the NWS. It must contain 2 decimal points to work correctly
*  `rwrOrig` *(Optional)*: Accepts the same type of code as `orig`, but specifically for the Regional Weather Roundup information ("Current Weather" card in the Vitality GOES interface). It appears that the weather roundup is sometimes issued by a different office than the rest of your forecast. Use the "Local Settings" section within Vitality GOES to figure this out. *If not set, your `orig` value will be used in place of rwrOrig*
*  `city` *(Optional)*: Your city/town name, exactly as it appears in the Regional Weather Roundup (RWR). The "Local Settings" screen in Vitality GOES can help you figure this out. *If not set, the "Current Weather" card in the current weather screen will not be shown.*

You may find that the location section is the hardest part of the config to set up. I would recommend leaving it at its defaults, then use the "Local Settings" screen in Vitality GOES to determine what each value should be set to for your location. Once you have it working client-side, configure the settings as appropraite in this config file.

## abi.ini, meso.ini, and l2.ini

abi.ini, meso.ini, and l2.ini all work the same. These files specify which images you want to display in the "Full Disk", "Mesoscale Images", and "Level 2 Graphics" sections of Vitality GOES, respectively. If a file contains no configured images, its section will be hidden in Vitality GOES. *This file will probably not need to be configured by you, unless you're customizing what gets displayed*

To understand how these config files work, let's look at an example section:

```ini
[fdfc_16]
path = {GOES16}/goes16/fd/fc/
title = "GOES 16 - Color"
filter = "_FD_"
color = #003241
videoPath = GOES16FalseColor.mp4
```

* `[fdfc_16]`: A unique identifier for the image. This can be anything, but it must be unique and contain no spaces
* `path`: The folder that holds all the images for a particular GOES product. In this example, it uses the `{GOES16}` variable defined in the `Paths` section of config.ini
* `title`: How the image will be labeled in Vitality GOES
* `filter` *(Optional)*: Only load images whose name on-disk contains the specified string. This can be used to select for a specific channel when you have multiple image channels in the same folder. It's only needed in some situations when you data is coming from goestools, but it's typically needed when your data comes from SatDump.
* `color` *(Optional)*: Color of the image's card in the web interface. Any CSS color code can be used. The color setting is optional and is not configured by default.
* `videoPath` *(Optional)*: the name of the video file that contains the timelapse of this product. Videos must be rendered seperately (by the [provided script](scripts.md#createvideos-abish) or any other means), and they must be kept in the `html/videos` folder of Vitality GOES. If you're not rendering timelapse videos, comment or remove this line.

## emwin.ini

emwin.ini contains information about the EMWIN image products you want to display. This config file works the same as the abi.ini, meso.ini, and l2.ini files with one exception: `path` is just the file name (including extension) for the product you want to display. No paths are included in this config file. *This file will probably not need to be configured by you, unless you're customizing what gets displayed*

A complete list of EMWIN image products can be found at [https://www.weather.gov/media/emwin/EMWIN_Image_and_Text_Data_Capture_Catalog_v1.3j.pdf](https://www.weather.gov/media/emwin/EMWIN_Image_and_Text_Data_Capture_Catalog_v1.3j.pdf). Use the GOES-N FN, but it must be in all caps in this config.
