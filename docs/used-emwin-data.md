# Data parsed from EMWIN and how it's used
The GOES HRIT/EMWIN downlink provides rich weather data, forecasts, and other information on the EMWIN virtual channels. This data is extremely useful to end users, but it's often encoded in a way that obscures its meaning - and it can be hard to find good documentation on reading the data.

Vitality GOES solves this by parsing the data and presenting pertinent information to you.

**NOTE:** This software assumes you only keep up to 36 hours of EMWIN text data in your emwin data folder. While you probably can keep more than that, you may start to notice that old alerts will stick around longer than they should. To work around this issue, I recommend archiving old alerts in daily zip archives. [See the scripts documentation for an example of how to do that](https://github.com/JVital2013/vitality-goes/blob/readme-drafting/docs/scripts.md#cleanup-emwintextsh).

## Alerts
Active alerts and warnings will show at the top of the Current Weather tab, if there are any.

### Weather Watch
Weather watches are included at the top of the Zone Forecast Product (GOES-N name - `ZFP*****.TXT`). These warnings are teal at the top of the Current Weather Screen

### Weather Warning
The following weather warnings are parsed and included at the top of the page Current Weather screen in red. The full text of these alerts are displayed. The geofencing information is parsed, which Vitality GOES checks against your configured latitude/longitude to see if you're within the warning area. It will also look for the `UNTIL` line so it can properly hide expired alerts.

| GOES-N Filename part | Type of Warning | 
|----------------------|-----------------|
| SQW*****.TXT         | Snow Squall     |
| DSW*****.TXT         | Dust Storm      |
| FRW*****.TXT         | Fire Weather    |
| FFW*****.TXT         | Flash Flood     |
| FLW*****.TXT         | Flood Warning   |
| SVR*****.TXT         | Thunderstorms   |
| TOR*****.TXT         | Tornado Warning |

### Local Emergencies
A number of local non-weather-related emergencies are broadcast across EMWIN and are shown at the top of the current weather screen. The full text of these alerts are shown. All alerts for the state you are in, plus the state in which your forecast office resides to ensure you don't miss any critical messages.

| GOES-N Filename Part | Type of Warning      | Color on Current Weather Screen |
|----------------------|----------------------|---------------------------------|
| LAE*****.TXT         | Local Area Emergency | Red                             |
| BLU*****.TXT         | Blue Alert           | Blue                            |
| CAE*****.TXT         | Amber Alert          | Amber                           |
| CDW*****.TXT         | Civil Danger Warning | Purple                          |
| EVI*****.TXT         | Evacuation Warning   | Brown                           |

## Current Weather
The Current Weather tab of Vitality GOES shows current weather conditions and forecasts for your configured location. The data comes from a number of seperate EMWIN text sources.

| GOES-N Filename Part | Product Name             | Card Title in Vitality GOES | Notes |
|----------------------|--------------------------|-----------------------------|-------|
| RWR*****.TXT         | Regional Weather Roundup | Current Weather             | |
| RAD*****.GIF         | *Radar Image*            | Current Radar               | The radar code must be specified in config.ini, and the same radar image must be available in emwin.ini. [See the config documentation for more info](config.md) |
| RWS*****.TXT         | Regional Weather Summary | Weather Summary             | |
| AFD*****.TXT         | Area Forecast Discussion | Weather Summary             | Only the short/near term section of the file, and it's only used if the Regional Weather Summary is not available for your area |
| PFM*****.TXT         | Point Forecast Matrix    | 7-Day Forecast              | Only querying daily highs and lows, humidity, chance of precipitation, and cloud cover information. Note that humidity is not given for days 4-7, so it is estimated based on dewpoint and temp |

## Other Resources
* [https://www.weather.gov/media/emwin/EMWIN_GOES-R_filename_convention.pdf](https://www.weather.gov/media/emwin/EMWIN_GOES-R_filename_convention.pdf): Breakdown of what EMWIN file names mean
* [https://www.weather.gov/media/emwin/EMWIN_Text_Product_Catalog_220214-1357.pdf](https://www.weather.gov/media/emwin/EMWIN_Text_Product_Catalog_220214-1357.pdf): List of EMWIN products (put here for reference, but I did not find it useful).
* [http://www.fireline.org/skywarn/emwin/products.html](http://www.fireline.org/skywarn/emwin/products.html): Information about some EMWIN products. The page was made specifically for Alachua SKYWARN, but it contains a lot of good general information
* [https://docs.google.com/spreadsheets/d/1Q1Vnk5Z028LEoY5JGHqZl42itHzmeV2QtGY6Ob_eTc4](https://docs.google.com/spreadsheets/d/1Q1Vnk5Z028LEoY5JGHqZl42itHzmeV2QtGY6Ob_eTc4): List of EMWIN products made by me, based on what I actually received on the GOES-16 downlink. This is broken down to only show one of each "Product Category" - **you can pretty much ignore all columns other than this and the description**. The rest if the columns are there to give an example of what I spot checked to determine what a given category contains. This file may not be completely accurate since there can be more than one type of data within a category. Since I produced this entirely by observation, categories may be missing or inaccurate. It was used to create Vitality GOES, so there's some level of accuracy. Please take this with a grain of salt.
