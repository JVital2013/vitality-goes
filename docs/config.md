# How to Configure Vitality GOES

Configuration files should be placed in the `config` folder where Vitality GOES is installed. To get started, [copy the contents of a provided example config](/configs) into the `config` folder where Vitality GOES is installed. Scriptconfig.ini is not needed for Vitality GOES itself, so skip it if present.

Example configs for using goestools data source are prefixed with "goestools-", while configs for SatDump are prefixed with "satdump-".

![Example Copy Configs](https://user-images.githubusercontent.com/24253715/213600531-dbd89150-309d-4695-b276-0df8e414ae55.png)

Configurations are highly customizable and can be modified to fit your ground station. A typical configuration will consist of several ini files as described in the following sections. Any comments must begin with a semicolon (;).

## config.ini

This is the main config file. It will likely need configured when you first deploy Vitality GOES. It is broken out into the following sections:

### general
* `siteTitle`: Sets the title of the Vitality GOES Web App. *Default = Vitality GOES*
* `siteTheme`: The theme for Vitality GOES. Leave unset to use the built-in theme, or set it to an installed theme. The included themes are "light", "purple", "red", and "uos". This option can be overridden per-browser by using the "Local Settings" screen. For more on theming, [look here](/docs/themes.md).
* `graphiteAPI`: If you're using goestools and want to view its decoder/demodulator statistcs, this should point to your graphite host. It must include the `/render/` path at the end to work properly. If you're not using goestools/graphite, comment/remove this line. For information on how to set up graphite, [look here](/docs/graphite.md).
* `satdumpAPI`: Points to the SatDump REST API to pull decoder/demodulator statistics. You must run SatDump with the `--http_server` flag to get statistics. If you're not using SatDump or don't want statistics, comment/delete this line.
* `emwinPath`: Point to the emwin repository of your choice. If you're picking up both GOES 16 and 18, you can use either's EMWIN files. Comment/delete this line to disable emwin text data parsing (Current Weather, Hurricane Center, and Other EMWIN).
* `adminPath`: The directory with admin text you want to display. SatDump will save these files out-of-the-box, but goestools must be patched with [this patch for it to show up](https://github.com/pietern/goestools/pull/105/files). Comment/delete this line to disable. For GOES satellites only.
* `fastEmwin`: Use a faster algorithm to parse EMWIN files for data. Recommended for Windows servers and servers with a large archive. Warning: if you turn this on, your EMWIN data folder must be flat! It cannot have subfolders of any kind, including dated subfolders.  *Default = false*.
* `spaceWeatherAlerts`: Set to true if you want to display space weather alerts along with other weather alerts. *Default = false*.
* `showSysInfo`: Set to true if you want to display information about your Vitality GOES server, such as system resource availability and system temps. Set to false to disable.
* `debug`: Set to true to enable PHP errors. Only set this to true if you're debugging data returned by the DataHandler (advanced users only).

### paths
A path should be set up for each satellite downlink you're receiving. Each path defined in this section creates a variable that can be used in the `path` options of your category ini files. One or more satellite should be listed here.

**NOTE:** This does not define the path of the images from a particular satellite, but rather the path for the entire downlink. For example, let's assume you're receiving GOES16, and your images are at `/home/pi/goes/goes16/fd/fc/...`. The `goes16` setting under `[paths]` would be set to `/home/pi/goes` (the parent path for the entire satellite downlink), not `/home/pi/goes/goes16` (the path just for the images from GOES16).

**Example** Let's say you have:
- `GOES16 = /path/to/goestoolsdata` under `[paths]` of your config.ini
- `path = {GOES16}/goes16/fd/fc/` is set under an image handler like `[fdfc_16]` in your abi.ini file

With this configuration, Vitality GOES will expect your images to be at `/path/to/goestoolsdata/goes16/fd/fc/`. Images may be in subfolders.

If hosted on Windows, set your paths to something like `GOES16 = C:\path\to\satdumpdata`

### categories
The category section defines one or more menu items (or "categories") within Vitality GOES. Each category can have any ID you want, and must point to an ini file that's also in Vitality GOES's `config` directory. See the "Category ini files" section below for info on how to customize them.

![Visual correlation between category ini and menu item](https://user-images.githubusercontent.com/24253715/214476111-a5c71e0d-abaf-497c-84e6-b2489b8a4eca.png)

### location
**The only required location option for all users is `timezone`.** A list of supported timezones can be found [here](https://www.php.net/manual/en/timezones.php).

If you are under the jurisdiction of the National Weather service and want to display local weather data, you need to configure the options below. Settings marked as "optional" will disable some functionality if not set. If a non-optional setting is not configured, the Current Weather screen will be hidden. These options can also be changed per client web browser by using the "Local Settings" screen in Vitality GOES.

| Option | Description | Required |
| - | - | - |
| `timezone` | Your local timezone | Required |
| `stateAbbr` | The post office abbreviation of your state. Also includes things like PR for Puerto Rico, AS for American Samoa, etc. | Required |
| `wxZone` | The weather zone of your location. This is typically your state abbreviation, a Z, and a 3 digit number. Example: PAZ066. You can either use the "Local Settings" section of Vitality GOES to figure this out, or use [this site](https://pnwpest.org/cgi-bin/wea3/wea3) to search for your town. "Weather Zone" shows up in the upper-right of that page. | Required |
| `orig` | The National Weather Service Forecast Office for your local weather information. The code needs to be the office call sign, plus the 2-letter state abbreviation. You can either use the "Local Settings" section of Vitality GOES to figure this out, or look at [https://en.wikipedia.org/wiki/List_of_National_Weather_Service_Weather_Forecast_Offices](https://en.wikipedia.org/wiki/List_of_National_Weather_Service_Weather_Forecast_Offices). For example, State College PA is "CTP", so orig needs to be set to `CTPPA` | Required |
| `lat` and `lon` | Your exact latitude and longitude. This is only used to determine if you're within an alert area as issued by the NWS. It must contain 2 decimal points to work correctly. | If not set, all supported EMWIN alerts issued by your local office will be shown |
| `rwrOrig` | Accepts the same type of code as `orig`, but specifically for the Regional Weather Roundup information ("Current Weather" card in the Vitality GOES interface). It appears that the weather roundup is sometimes issued by a different office than the rest of your forecast. Use the "Local Settings" section within Vitality GOES to figure this out. | If not set, your `orig` value will be used in place of rwrOrig |
| `city` | Your city/town name, exactly as it appears in the Regional Weather Roundup (RWR). The "Local Settings" screen in Vitality GOES can help you figure this out. | If not set, the "Current Weather" card in the current weather screen will not be shown. |
| `radarCode` | The last 5 letters of the radar file for your region. In the emwin directory, all radar files end with RAD{radarCode}.GIF. | If not set, your local radar will not be shown on the current weather screen |
  
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

As a bonus - if you have your local radar image configured in one of your category ini files, and you have video rendering enabled [with a secondary script](/docs/scripts.md#createvideos-emwin), the timelapse radar will be visible on the current weather page.

You may find that the location section is the hardest part of the config to set up. I would recommend leaving it at its defaults, then use the "Local Settings" screen in Vitality GOES to determine what each value should be set to for your location. Once you have it working client-side, configure the settings as appropraite in this config file.

### otheremwin
If you are displaying EMWIN data, this optional section controls data seen on the "Other EMWIN" screen. Weather satellite TLEs and the EMWIN license cannot be removed.

* `ini`: The path of otheremwin.ini, which is a file that specifies what additional information to present to all users on the Other EMWIN screen.
  * Defaults to /configs/otheremwin.ini.
  * See the ["otheremwin.ini Configuration" section below](#otheremwinini-configuration) for more.
* `allowUserLoader`: Turns the "Load Additional Data" functionality on/off on the Other EMWIN screen.
  * Accepts "true" or "false".
  * Defaults to "true".
* `maxUserFiles`: The maximum number of files to allow user to query through the Additional Data loader.
  * Defaults to 1000.
  * Set to 0 to disable the limit, if you are absolutely insane.

Note: `maxUserFiles` counts EMWIN text files read from the disk as a result of user-queried data only. Weather satellite TLEs, EMWIN licenses, and files configured in otheremwin.ini are not counted. If the user queries more files than they are allowed, it will return no data for user-queried files only.

## Category ini files (abi.ini, meso.ini, etc)
All category ini files will have a `[_category_]` section at the top, followed by any number of image sections.

### \_category\_ definition
```ini
[_category_]
title = "Full Disk"
icon = globe-americas
```

* `title`: The name of the category, as shown in the main menu and title bar
* `icon`: The FontAwesome icon to use in the menu. Vitality GOES currently comes with FontAwesome 5, so [look here for available icons](https://fontawesome.com/v5/search).

### Image sections
You can have multiple image sections per ini file

```ini
[fdfc_16]
path = {GOES16}/goes16/fd/fc/
title = "GOES 16 - Color"
fast = false
mode = endz
filter = _FD_
color = #003241
videoPath = GOES16FalseColor.mp4
```

* `[fdfc_16]`: A unique identifier for the image. This can be anything, but it must be unique and contain no spaces
* `path`: The folder that holds all the images for a particular GOES product. In this example, it uses the `{GOES16}` variable defined in the `Paths` section of config.ini
* `title`: How the image will be labeled in Vitality GOES
* `fast` *(Default: false)*:  Use a faster algorithm to parse data. Recommended for Windows servers and servers with a large archives. Warning: if you turn this on, the path for this image section must be flat! It cannot have subfolders of any kind, including dated subfolders.
* `mode` *(Default: endz)*: Defines the mode the internal image filename parser should use. This should be based on how your image files are named. See below for a table of supported filename parser modes
* `filter` *(Optional)*: Only load images whose filename contains the specified string. This can be used to select for a specific channel when you have multiple image channels in the same folder. If all of your images of a unique type are in the same folder, this is not needed.
* `color` *(Optional)*: Color of the image's card in the web interface. Any CSS color code can be used. The color setting is optional and is not configured by default.
* `videoPath` *(Optional)*: the name of the video file that contains the timelapse of this product. Videos must be rendered seperately (by the [provided script](scripts.md#createvideos-abish) or any other means), and they must be kept in the `html/videos` folder of Vitality GOES. If you're not rendering timelapse videos, comment or remove this line.

If a file contains no configured images, or if it's `[_category_]` section is missing, it will be hidden in Vitality GOES. *These files will probably not need to be configured by you, unless you're customizing what gets displayed*

### Supported filename parser modes
The mode selected for an image tells Vitality GOES how to parse its filename. It affects where the timestamp should be in the filename, how the timestamp should be formatted, and how the `filter` attribute is applied to the filename.

The following filename parser modes are supported for use in the `mode` attribute of your category ini files:

*Example Time: January 24, 2023 11:06:36 UTC*
| Mode       | Timestamp Location        | Timestamp Format Example     | Filter matches any text...      | 
| ---------- | ------------------------- | ---------------------------- | ------------------------------- |
| begin      | Beginning of filename     | 20230124110636               | After the timestamp             |
| beginu     | Beginning of filename     | 20230124_110636              | After the timestamp             |
| beginz     | Beginning of filename     | 20230124T110636Z             | After the timestamp             |
| emwin | In the middle of the filename as specified in the [EMWIN naming convention](https://www.weather.gov/emwin/format) | 20230124110636 | After the timestamp |
| end        | End of filename           | 20230124110636               | Before the timestamp            |
| endu       | End of filename           | 20230124_110636              | Before the timestamp            |
| **endz**   | **End of filename**       | **20230124T110636Z**         | **Before the timestamp**        |

## otheremwin.ini Configuration
otheremwin.ini contains a list of one or more "selectors" that find and display EMWIN files based on their Eight-Character EMWIN file name (the last 8 characters before the file extension). If otheremwin.ini is not found, only Weather satellite TLEs, the EMWIN license file, and user-queried data (if configured) will be displayed.

Here is an example selector you can use in otheremwin.ini:

```ini
[ADMSDM]
identifier = "ADMSDM.*"
title = "SDM OPS Status Messages"
truncate = 3
format = paragraph
```

* `[ADMSDM]`: A unique identifier for the text data. This can be anything, but it must be unique and contain no spaces.
* `identifier`: A regular expression that matches the Eight character EMWIN file name. The regular expression must match the entire eight-character name. In this example, the eight-character name must start with "ADMSDM", but it can end with anything.
* `title`: How the text data will be labeled in Vitality GOES
* `truncate`: How many lines to remove from the beginning of the file. This is to remove additional headers.
* `format`: Can be "paragraph" or "formatted"
  * `paragraph`: The data consists of sentences that can be converted easily into paragraph form.
    * If Vitality GOES detects that a given file has more than one message, it will split the file up into its constituent messages
    * The first "paragraph" of the file (usually a header) will be shown on all the parts when split.
    * This means it's important to configure `truncate` correctly!
  * `formatted`: The data contains tables or other pre-formatted data that does not convert nicely into paragraphs.
    * If you have issues using "paragraph", use "formatted" instead.
