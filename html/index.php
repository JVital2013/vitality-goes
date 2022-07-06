<!DOCTYPE html>
<html>
	<head>
		<title>Vitality GOES</title>

		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">

		<link rel="apple-touch-icon" href="/icon-512x512.png">
		<link rel="manifest" href="/manifest.json?v=20220616">
		<link rel="stylesheet" href="/styles.css?v=20220706">
		<link rel="stylesheet" href="/opensans.css">
		<link rel="stylesheet" href="/simplerpicker/simplerpicker.css">
		<link rel="stylesheet" href="/fontawesome/css/all.css">
		<link rel="stylesheet" href="/lightgallery/css/lightgallery.css">
		<link rel="stylesheet" href="/lightgallery/css/lg-zoom.css">
		<link rel="stylesheet" href="/lightgallery/css/lg-jumpto.css">
		<link href="splashscreens/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphoneplus_splash.png" media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphonexr_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
		<link href="splashscreens/iphonexsmax_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
		<script src='/lightgallery/lightgallery.umd.js'></script>
		<script src="/lightgallery/plugins/zoom/lg-zoom.umd.js"></script>
		<script src="/lightgallery/plugins/jumpto/lg-jumpto.umd.js"></script>
		<script src="/simplerpicker/simplerpicker.js"></script>
		<script src='/script.js?v=20220706'></script>
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
