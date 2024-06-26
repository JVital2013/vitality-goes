# Data parsed from EMWIN and how it's used
The GOES HRIT/EMWIN downlink provides rich weather data, forecasts, and other information on the EMWIN virtual channels. This data is extremely useful to end users, but it's often encoded in a way that obscures its meaning - and it can be hard to find good documentation on reading the data. Vitality GOES solves this by parsing the data and presenting pertinent information to you.

**NOTE:** This software assumes you only keep up to 36 hours of EMWIN text data in your emwin data folder. You can keep a week of data with `fastEmwin` enabled in your config. If you keep more data than is recommended, performance will degrade and old alerts will stick around for a long time.

To work around this issue, I recommend archiving old text products in daily zip archives. [See the scripts documentation for an example of how to do that](/docs/scripts.md#cleanup-emwintextsh).

## Alerts
Active alerts and warnings will show at the top of the Current Weather tab, if there are any.

### Weather Watch
Weather watches are included at the top of the Zone Forecast Product (GOES-N name - `ZFP*****.TXT`). These warnings are teal at the top of the Current Weather Screen

### Weather Warning
The following weather warnings are parsed and included at the top of the page Current Weather screen in red. The full text of these alerts are displayed. The geofencing information is parsed, which Vitality GOES checks against your configured latitude/longitude to see if you're within the warning area. It will also look for an expire time so past alerts can be hidden.

| GOES-N Filename part | Type of Warning            |
|----------------------|----------------------------|
| SQW*****.TXT         | Snow Squall                |
| DSW*****.TXT         | Dust Storm                 |
| FRW*****.TXT         | Fire Weather               |
| FFW*****.TXT         | Flash Flood                |
| FLW*****.TXT         | Flood Warning              |
| SPS*****.TXT         | Special Weather Statements |
| SVR*****.TXT         | Thunderstorms              |
| TOR*****.TXT         | Tornado Warning            |
| EWW*****.TXT         | Extreme Wind Warning       |

### Local Emergencies
A number of local non-weather-related emergencies are broadcast across EMWIN and are shown at the top of the current weather screen. The full text of these alerts are shown. All alerts on disk for the state you are in are shown.

| GOES-N Filename Part | Type of Warning      | Color on Current Weather Screen |
|----------------------|----------------------|---------------------------------|
| LAE*****.TXT         | Local Area Emergency | Red                             |
| BLU*****.TXT         | Blue Alert           | Blue                            |
| CAE*****.TXT         | Amber Alert          | Amber                           |
| CDW*****.TXT         | Civil Danger Warning | Purple                          |
| EVI*****.TXT         | Evacuation Warning   | Brown                           |

### Hurricane Local Statement
Hurricane Local Statements, or HLS, are public releases prepared by local National Weather Service offices in or near a hurricane-threatened area. It gives specific details for its county/parish warning area on (1) weather conditions, (2) evacuation decisions made by local officials, and (3) other precautions necessary to protect life and property. The most recent HLS for your area is shown at the top of the current weather page in red.

## Current Weather
The Current Weather tab of Vitality GOES shows current weather conditions and forecasts for your configured location. The data comes from a number of seperate EMWIN text sources.

| GOES-N Filename Part | Product Name             | Card Title in Vitality GOES | Notes |
|----------------------|--------------------------|-----------------------------|-------|
| RWR*****.TXT         | Regional Weather Roundup | Current Weather             | |
| RAD*****.GIF         | *Radar Image*            | Current Radar               | The radar code must be specified in config.ini, and the same radar image must be available in emwin.ini. [See the config documentation for more info](config.md) |
| RWS*****.TXT         | Regional Weather Summary | Weather Summary             | |
| AFD*****.TXT         | Area Forecast Discussion | Weather Summary             | Only the short/near term section of the file, and it's only used if the Regional Weather Summary is not available for your area |
| PFM*****.TXT         | Point Forecast Matrix    | 7-Day Forecast              | Only querying daily highs and lows, humidity, chance of precipitation, and cloud cover information. Note that humidity is not given for days 4-7, so it is estimated based on dewpoint and temp |
| AFM*****.TXT         | Area Forecast Matrix     | 7-Day Forecast              | Works the same as the Point Forecast Matrix. Only used if the PFM is not available |
| ZFP*****.TXT         | Zone Forecast Product    | Forecast (text)             | |

## EMWIN Imagery
EMWIN Imagery is configured [along with other image categories](config.md#category-ini-files-abiini-mesoini-etc).

## Other EMWIN
The Other EMWIN tab of Vitality GOES shows miscellaneous data configured by the system administrator, as well as a data loader that allows the user to query additional data.

To configure the data shown on this screen for all users, or to disable the additional data loader, see [the config documentation](config.md#otheremwin). The options available in [otheremwin.ini selectors](config.md#otheremwinini-configuration) match those available in the additional data loader.

The additional data loader also contains an "Automatic Data Selector" that makes it easy to discover what data is available to view.

![Other EMWIN screenshot](https://github-production-user-asset-6210df.s3.amazonaws.com/24253715/248586409-6b5f220f-a331-4ac9-b259-5489c585ac95.png)
In addition to user and admin configured data, the following information is always available on this screen:

| GOES-N Filename Part | Product Name                  | Card Title in Vitality GOES  | Latest/All Available | Notes |
|----------------------|-------------------------------|------------------------------|----------------------|-------|
| FEEBAC1S.TXT         | ?                             | EMWIN Licensing Info         | Latest               | Issued daily around 15:30 UTC |
| EPHTWOUS.TXT         | Weather Satellite Ephemerides | Weather Satellite TLE        | Latest               | Issued several times daily and can be used to track other satellites, including Polar orbiting satellites commonly tracked by amateurs. There are other EPH*****.TXT files that contain operational information of other NOAA-operated satellites |
| N/A                  | Admin Text (HRIT VCID 0)      | Latest Admin Message         | Latest               | Only visible if [adminPath is configured in your config.ini](config.md#configini), and you patched goesproc [with this patch](https://github.com/pietern/goestools/pull/105/files) or are using SatDump. |

## Hurricane Center
Vitality GOES's Hurricane Center displays available data from Tropical Cyclone Advisory files (TCA\*\*\*\*\*.TXT) for Atlantic cyclones, and HEPZ\*\*\*\*.TXT files for cyclones in the Eastern Pacific. This includes storm position, direction, air pressure, maximum sustained winds, and whether the storm is strengthening or weakening.

Additionally, graphics of the storm track to date, as well as the current storm forecast, is sourced from the following files:

| GOES-N Filename part | Type of Graphic      | 
|----------------------|----------------------|
| AL\*\*YYRS.PNG | Atlantic Basin Storm Track, Watches, and Warnings |
| EP\*\*YYWS.PNG | Pacific Basin Storm Track, Watches, and Warnings |
| AL\*\*YY5D.PNG | Atlantic Basin Storm 5-Day Forecast |
| EP\*\*YY5D.PNG | Pacific Basin Storm 5-Day Forecast |

## Other Resources
* [https://www.weather.gov/media/emwin/EMWIN_GOES-R_filename_convention.pdf](https://www.weather.gov/media/emwin/EMWIN_GOES-R_filename_convention.pdf): Breakdown of what EMWIN file names mean
* [https://www.weather.gov/media/emwin/EMWIN_Text_Product_Catalog_220214-1357.pdf](https://www.weather.gov/media/emwin/EMWIN_Text_Product_Catalog_220214-1357.pdf): List of EMWIN products (put here for reference, but I did not find it useful).
* [http://www.fireline.org/skywarn/emwin/products.html](http://www.fireline.org/skywarn/emwin/products.html): Information about some EMWIN products. The page was made specifically for Alachua SKYWARN, but it contains a lot of good general information
* [https://docs.google.com/spreadsheets/d/1Q1Vnk5Z028LEoY5JGHqZl42itHzmeV2QtGY6Ob_eTc4](https://docs.google.com/spreadsheets/d/1Q1Vnk5Z028LEoY5JGHqZl42itHzmeV2QtGY6Ob_eTc4): List of EMWIN products made by me, based on what I actually received on the GOES-16 downlink. This is broken down to only show one of each "Product Category" - **you can pretty much ignore all columns other than this and the description**. The rest if the columns are there to give an example of what I spot checked to determine what a given category contains. This file may not be completely accurate since there can be more than one type of data within a category. Since I produced this entirely by observation, categories may be missing or inaccurate. It was used to create Vitality GOES, so there's some level of accuracy. Please take this with a grain of salt.
