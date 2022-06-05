# How to Configure Vitality GOES

The Vitality GOES config is stored in `html/config` and is broken out into these files:

* **config.ini**: The main configuration file
* **emwin.ini**: Stores information about the emwin images you want to display. This file has no effect on emwin text that is displayed
* **abi.ini**: Contains information about your full-disk images. If you're doing any Sanchez renders, I'd put them in this file as well
* **meso.ini**: Contains information about your mesoscale images.
* **l2.ini**: Contains infromation about your ABI level 2 products. These images contain information about estimated rainfall, land surface temp, sea surface temp, and more. Note that goestools does not receive these unless your goesproc config is set up to do so. The sample config in this repository is configured correctly, but if you're not saving these files, simply leave l2.ini empty.

These ini files are parsed with the php [parse_ini_file](https://www.php.net/manual/en/function.parse-ini-file.php) function, so any comments must begin with a semicolon (;).

## config.ini

This is the main config file, which is broken out into the following sections:

### General
* `graphiteAPI`: Points to your graphite host. It must include the `/render/` path at the end to work properly. If you're not using Graphite, comment this line out
* `emwinPath`: Point to the emwin repository of your choice. If you're picking up both GOES West and East, you can use either EMWIN locaiton. Comment this line out to completely disable emwin data (text and images)
* `adminPath`: The directory with admin text you want to display. Comment to disable
* `showSysInfo`: True if on the same system as goestools. Otherwise, set it to false

### Paths
The Paths section is unnecessary, but it is recommended that you set up a path for each satellite you're receiving. Each path defined in this section creates a variable that can be used in the abi, meso, and l2 ini files. 

Example: `GOES16 = /home/jamie/Desktop/sdr-recordings` allows `{GOES16}` to be used in the `path` of any image in the abi, meso, and l2 ini files.

### Location
This section contains information about your physical location. If you're not displaying EMWIN data, the only thing you need to configure is timezone. A list of supported timezones can be found [here](https://www.php.net/manual/en/timezones.php).

If you are displaying EMWIN/local weather data, here's what each of the options mean. Note that these options can also be changed per client web browser by using the "configure location" screen in Vitality GOES.

* `radarCode`: The last 5 letters of the radar file for your region. In the emwin directory, all radar files end with RAD{radarCode}.GIF. At the time of writing, valid radarCodes are:
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
*  `orig`: The National Weather Service Originator for your local weather information. You can either use the "Configure Location" section of Vitality GOES to figure this out, or 

You may find that the location section is the hardest part of the config to set up. I would recommend leaving it at its defaults, then use the "Configure Location" screen in Vitality GOES to determine what each value should be set to for your location. Once you have it working client-side, configure the settings as appropraite in this config file.
