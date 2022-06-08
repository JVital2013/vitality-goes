# Data parsed from EMWIN and how it's used
The GOES HRIT/EMWIN downlink provides rich weather data, forecasts, and other information on the EMWIN virtual channels. This data is extremely useful to end users, but it's often encoded in a way that obscures its meaning - and it can be hard to find good documentation on reading the data.

Vitality GOES solves this by parsing the data and presenting pertinent information to you.

## Alerts
Active alerts and warnings will show at the top of the Current Weather tab, if there are any.

### Weather Warning Alert
The following weather warnings are parsed and included in  at the top of the page Current Weather screen in red. The full text of these alerts are displayed. The geofencing information is parsed, which Vitality GOES checks against your configured latitude/longitude to see if you're within the warning area. It will also look for the UNTIL like so it can properly hide expired alerts.

| GOES-N File name part | Type of Warning | 
|-----------------------|-----------------|
| SQW*****.TXT          | Snow Squall     |
| DSW*****.TXT          | Dust Storm      |
| FRW*****.TXT          | Fire Weather    |
| FFW*****.TXT          | Flash Flood     |
| FLW*****.TXT          | Flood Warning   |
| SVR*****.TXT          | Thunderstorms   |
| TOR*****.TXT          | Tornado Warning |

## Other Resources
* [https://www.weather.gov/media/emwin/EMWIN_GOES-R_filename_convention.pdf](https://www.weather.gov/media/emwin/EMWIN_GOES-R_filename_convention.pdf): Breakdown of what EMWIN file names mean
* [https://www.weather.gov/media/emwin/EMWIN_Text_Product_Catalog_220214-1357.pdf](https://www.weather.gov/media/emwin/EMWIN_Text_Product_Catalog_220214-1357.pdf): List of EMWIN products (put here for reference, but I did not find it useful).
* [https://docs.google.com/spreadsheets/d/1Q1Vnk5Z028LEoY5JGHqZl42itHzmeV2QtGY6Ob_eTc4](https://docs.google.com/spreadsheets/d/1Q1Vnk5Z028LEoY5JGHqZl42itHzmeV2QtGY6Ob_eTc4): List of EMWIN products made by me, based on what I actually received on the GOES-16 downlink. This is broken down to only show one of each "Product Category" - **you can pretty much ignore all columns other than this and the description**. The rest if the columns are there to give an example of what I spot checked to determine what a given category contains. This file may not be completely accurate since there can be more than one type of data within a category. Since I produced this entirely by observation, categories may be missing or inaccurate. It was used to create Vitality GOES, so there's some level of accuracy. Please take this with a grain of salt.
