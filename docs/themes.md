# Themes

Vitality GOES supports theming to give the web app a completely different look and feel. To select a theme, [configure the `siteTheme` option in your config.ini (all users)](/docs/config.md#general) to match the desired theme ID.

Your users can also select an available theme from the "Local Settings" screen in the Web App to customize it on their local device.

<img src='https://user-images.githubusercontent.com/24253715/211178470-463b3597-2a65-469f-b75e-e27278e34ada.png' width='49%' /> <img src='https://user-images.githubusercontent.com/24253715/211178484-245fc793-4df8-47ce-889a-e99e18fb7d93.png' width='49%' />

## Included Themes
The following themes are included with Vitality GOES:

|Name                 |ID (Folder Name) |Description                                                                     |
|:--------------------|:----------------|:-------------------------------------------------------------------------------|
|*Built-in*           |*default/unset*  |*The default theme for Vitality GOES if another valid theme is not selected*    |
|Dark Red             |red              |Red variant of the built-in theme                                               |
|GOES Assistant       |light            |Light theme inspiried by Home Assistant                                         |
|Purple               |purple           |In case you REALLY like purple                                                  |
|RobCo Industries UOS |uos              |Vitality GOES for RobCo's Unified Operating System (UOS). Pip-Boy not included. |

## Installing Themes
Themes are nothing more than a folder containing a file named `theme.ini`, along with one or more CSS stylesheets and associated resources.

To install a theme, copy the folder into the `/themes/` folder of your Vitality GOES installation. Afterwards, you can use its folder name in `siteTheme` of your config.ini file. It will be selectable in the "Local Settings" screen.

## Making Themes
TODO
