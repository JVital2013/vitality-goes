<?php
/* 
 * Copyright 2022 Jamie Vital
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
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Vitality GOES</title>

		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">

		<link rel="apple-touch-icon" href="/icon-512x512.png">
		<link rel="manifest" href="/manifest.json?v=20220616">
		<link rel="stylesheet" href="/styles.css?v=20221021">
		<link rel="stylesheet" href="/opensans.css">
		<link rel="stylesheet" href="/simplerpicker/simplerpicker.css">
		<link rel="stylesheet" href="/fontawesome/css/all.css">
		<link rel="stylesheet" href="/lightgallery/css/lightgallery.css?v=20221016">
		<link rel="stylesheet" href="/lightgallery/css/lg-zoom.css?v=20221016">
		<link rel="stylesheet" href="/lightgallery/css/lg-jumpto.css?v=20220811">
		<link href="splashscreens/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphoneplus_splash.png" media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphonexr_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphonexsmax_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<script src='/lightgallery/lightgallery.umd.js?v=20221016'></script>
		<script src="/lightgallery/plugins/zoom/lg-zoom.umd.js?v=20221016"></script>
		<script src="/lightgallery/plugins/jumpto/lg-jumpto.umd.js?v=20220811"></script>
		<script src="/simplerpicker/simplerpicker.js"></script>
		<script src='/script.js?v=20221021'></script>
	</head>
	<body>
		<div class='topBar'>
			<div class='topBarInner'>
				<i class='fa fa-satellite barLogo' aria-hidden="true" onclick='slideDrawer();'></i>
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
