<?php
/* 
 * Copyright 2022-2024 Jamie Vital
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

//Get root directory of the application
$programPath = dirname(__FILE__);
$programURL = str_replace(str_replace("\\", "/", $_SERVER['DOCUMENT_ROOT']), "",  str_replace("\\", "/", $programPath));

//Load data from config
require_once("$programPath/functions.php");
$siteTitle = "Vitality GOES";
$themeblock = "";

if(file_exists("$programPath/config/config.ini"))
{
	$config = parse_ini_file("$programPath/config/config.ini", true, INI_SCANNER_RAW);

	//Get title of site
	if(array_key_exists('siteTitle', $config['general'])) $siteTitle = htmlspecialchars(strip_tags($config['general']['siteTitle']));

	//Load Theme
	$theme = loadTheme($config);
	if($theme !== false)
	{
		foreach($theme['stylesheets'] as $stylesheet)
		{
			if(preg_match("/^https?:\/\/.*$/", $stylesheet)) $stylesheetURL = $stylesheet;
			else $stylesheetURL = "$programURL/themes/{$theme['slug']}/$stylesheet?v=20230625";
			$themeblock .= "<link rel=\"stylesheet\" href=\"$stylesheetURL\">\n\t\t";
		}
	}
}
?>
<!DOCTYPE html>
<html>
	<head>
		<title><?php echo $siteTitle ?></title>

		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">

		<link rel='shortcut icon' type="image/x-icon" href="<?php echo $programURL; ?>/favicon.ico" />
		<link rel="apple-touch-icon" href="<?php echo $programURL; ?>/icon-512x512.png">
		<link rel="manifest" href="<?php echo $programURL; ?>/manifest.php">
		<link rel="stylesheet" href="<?php echo $programURL; ?>/styles.css?v=20230625">
		<link rel="stylesheet" href="<?php echo $programURL; ?>/opensans.css">
		<link rel="stylesheet" href="<?php echo $programURL; ?>/simplerpicker/simplerpicker.css">
		<link rel="stylesheet" href="<?php echo $programURL; ?>/fontawesome/css/all.css">
		<link rel="stylesheet" href="<?php echo $programURL; ?>/lightgallery/css/lightgallery.css?v=20221016">
		<link rel="stylesheet" href="<?php echo $programURL; ?>/lightgallery/css/lg-zoom.css?v=20221016">
		<link rel="stylesheet" href="<?php echo $programURL; ?>/lightgallery/css/lg-jumpto.css?v=20220811">
		<?php echo $themeblock; ?>
		
		<link href="<?php echo $programURL; ?>/splashscreens/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="<?php echo $programURL; ?>/splashscreens/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="<?php echo $programURL; ?>/splashscreens/iphoneplus_splash.png" media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<link href="<?php echo $programURL; ?>/splashscreens/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<link href="<?php echo $programURL; ?>/splashscreens/iphonexr_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="<?php echo $programURL; ?>/splashscreens/iphonexsmax_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<script src='<?php echo $programURL; ?>/lightgallery/lightgallery.umd.js?v=20221016'></script>
		<script src="<?php echo $programURL; ?>/lightgallery/plugins/zoom/lg-zoom.umd.js?v=20230923"></script>
		<script src="<?php echo $programURL; ?>/lightgallery/plugins/jumpto/lg-jumpto.umd.js?v=20220811"></script>
		<script src="<?php echo $programURL; ?>/simplerpicker/simplerpicker.js"></script>
		<script src='<?php echo $programURL; ?>/script.js?v=20231227'></script>
	</head>
	<body>
		<div class='topBar'>
			<div class='topBarInner'>
				<i class='fas fa-bars barLogo' aria-hidden="true" onclick='slideDrawer();'></i>
				<div class='barTitle' id='barTitle'></div>
				<div class="barRefresh" onclick="menuSelect(selectedMenu)"><i class="fa fa-sync" aria-hidden="true"></i></div>
			</div>
		</div>
		<div class='sideBar' id='sideBar'>
			<div class='mainBodyPadding'></div>
		</div>
		<div class='mainBody' onclick='retractDrawer();'>
			<div class='mainBodyPadding'></div>
			<div id='mainContent' class='mainContent'></div>
		</div>
	</body>
</html>
