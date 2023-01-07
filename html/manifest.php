<?php
/* 
 * Copyright 2022-2023 Jamie Vital
 * This software is licensed under the GNU General Public License
 * 
 * This file is part of Vitality GOES.
 * Vitality GOES is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Vitality GOES is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Vitality GOES.  If not, see <http://www.gnu.org/licenses/>.
 */

//Load data from config
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
$config = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/config.ini", true, INI_SCANNER_RAW);

//Get title of site
if(array_key_exists('siteTitle', $config['general'])) $siteTitle = htmlspecialchars(strip_tags($config['general']['siteTitle']));
else $siteTitle = "Vitality GOES";

//Get theme information
$theme = loadTheme($config);
if($theme !== false && array_key_exists('themeColor', $theme)) $themeColor = addslashes($theme['themeColor']);
else $themeColor = "#111111";

header('Content-Type: application/json; charset=utf-8');
?>
{
    "theme_color": "<?php echo $themeColor; ?>",
    "background_color": "<?php echo $themeColor; ?>",
    "display": "standalone",
    "scope": "/",
    "start_url": "/",
    "name": "Vitality GOES Ground Station",
    "short_name": "<?php echo $siteTitle; ?>",
    "icons": [
        {
            "src": "/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icon-256x256.png",
            "sizes": "256x256",
            "type": "image/png"
        },
        {
            "src": "/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png"
        },
        {
            "src": "/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
