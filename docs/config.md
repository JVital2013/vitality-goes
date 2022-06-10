# How to Configure Vitality GOES

The Vitality GOES config is stored in `html/config`. You can start with the configs provided, then change them as necessary. The configuration is broken out into the following files:

* **config.ini**: The main configuration file
* **emwin.ini**: Stores information about the emwin images you want to display. This file has no effect on emwin text that is displayed
* **abi.ini**: Contains information about your full-disk images. If you're doing any Sanchez renders, I'd put them in this file as well
* **meso.ini**: Contains information about your mesoscale images.
* **l2.ini**: Contains infromation about your ABI Level 2 products. These images contain information about estimated rainfall, land surface temp, sea surface temp, and more. Note that goestools does not receive these unless your goesproc config is set up to do so. The sample config in this repository is configured correctly, but if you're not saving these files, simply leave l2.ini empty.

These ini files are parsed with the php [parse_ini_file](https://www.php.net/manual/en/function.parse-ini-file.php) function, so any comments must begin with a semicolon (;).

## config.ini

This is the main config file. It will likely need configured when you first deploy Vitality GOES. It is broken out into the following sections:

### General
* `graphiteAPI`: Points to your graphite host. It must include the `/render/` path at the end to work properly. If you're not using Graphite, comment this line out
* `emwinPath`: Point to the emwin repository of your choice. If you're picking up both GOES West and East, you can use either EMWIN locaiton. Comment this line out to completely disable emwin data (text and images)
* `adminPath`: The directory with admin text you want to display. Goestools must be patched with [this patch anyway for it to show up](https://github.com/pietern/goestools/pull/105/files), so comment it to disable.
* `showSysInfo`: True if on the same system as goestools. Otherwise, set it to false

### Paths
The Paths section is unnecessary, but it is recommended that you set up a path for each satellite you're receiving. Each path defined in this section creates a variable that can be used in the abi, meso, and l2 ini files. 

Example: `GOES16 = /path/to/goestoolsdata` allows `{GOES16}` to be used in the `path` of any image in the abi, meso, and l2 ini files.

### Location
This section contains information about your physical location. If you're not displaying EMWIN data, the only thing you need to configure is `timezone`. A list of supported timezones can be found [here](https://www.php.net/manual/en/timezones.php).

If you are displaying EMWIN/local weather data, here's what each of the other options mean. Note that these options can also be changed per client web browser by using the "configure location" screen in Vitality GOES.

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
*  `wxZone`: The weather zone of your location. This is typically your state abbreviation, a Z, and a 3 digit number. Example: PAZ066. You can either use the "Configure Location" section of Vitality GOES to figure this out, or use [this site](https://pnwpest.org/cgi-bin/wea3/wea3) to search for your town. "Weather Zone" shows up in the upper-right of that page.
*  `orig`: The National Weather Service Forecast Office for your local weather information. The code needs to be the office call sign, plus the 2-letter state abbreviation. You can either use the "Configure Location" section of Vitality GOES to figure this out, or look at [https://en.wikipedia.org/wiki/List_of_National_Weather_Service_Weather_Forecast_Offices](https://en.wikipedia.org/wiki/List_of_National_Weather_Service_Weather_Forecast_Offices). For example, State College PA is "CTP", so orig needs to be set to `CTPPA`
*  `rwrOrig`: Accepts the same type of code as `orig`, but specifically for the Regional Weather Roundup information (RWR; current conditions in the Vitality GOES interface). It appears that the weather roundup is sometimes issued by a different office than the rest of your forecast. Use the "Configure Location" section within Vitality GOES to figure this out.
*  `city`: Your city/town name, exactly as it appears in the Regional Weather Roundup (RWR). This must be in all caps. The "Configure Location" screen in Vitality GOES can help you figure this out.
*  `lat` and `lon`: Your exact latitude and longitude. This is only used to determine if you're within an alert area as issued by the NWS. It must contain 2 decimal points to work correctly

You may find that the location section is the hardest part of the config to set up. I would recommend leaving it at its defaults, then use the "Configure Location" screen in Vitality GOES to determine what each value should be set to for your location. Once you have it working client-side, configure the settings as appropraite in this config file.

## abi.ini, meso.ini, and l2.ini

abi.ini, meso.ini, and l2.ini all work the same. These files specify which images you want to display in the "Full Disk", "Mesoscale Images", and "Level 2 Graphics" sections of Vitality GOES, respectively. If a file contains no configured images, its section will be hidden in Vitality GOES. *If you're receiving GOES-16, you can probably use this file as-is*

To understand how these config files work, let's look at an example section:

```ini
[fdfc_16]
path = {GOES16}/goes16/fd/fc/
title = "GOES 16 - Color"
videoPath = GOES16FalseColor.mp4
```

* `[fdfc_16]`: A unique identifier for the image. This can be anything, but it must be unique and contain no spaces
* `path`: The folder that holds all the images for a particular GOES product. In this example, it uses the `{GOES16}` variable defined in the `Paths` section of config.ini
* `title`: How the image will be labeled in Vitality GOES
* `videoPath`: the name of the video file that contains the timelapse of this product. Videos must be rendered seperately (ex. by the [provided script](scripts.md#createvideos-abish)), and they must be kept in the `html/videos` folder of Vitality GOES. If you're not rendering timelapse videos, comment or remove this line.

## emwin.ini

emwin.ini contains information about the EMWIN image products you want to display. This config file works the same as the abi.ini, meso.ini, and l2.ini files with one exception: `path` is just the file name (including extension) for the product you want to display. No paths are included in this config file. *This file will probably not need to be configured by you, unless you're customizing what gets displayed*

A complete list of EMWIN image products can be found at [https://www.weather.gov/media/emwin/EMWIN_Image_and_Text_Data_Capture_Catalog_v1.3h.pdf](https://www.weather.gov/media/emwin/EMWIN_Image_and_Text_Data_Capture_Catalog_v1.3h.pdf). Use the GOES-N FN, but it must be in all caps in this config.
