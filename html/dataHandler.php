<?php
//Load External Functions
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
$config = loadConfig();

//Load Current User Settings from Cookie
$sendCookie = false;
if(array_key_exists('currentSettings', $_COOKIE))
{
	$currentSettings = json_decode($_COOKIE['currentSettings'], true);
	if(!is_array($currentSettings))
	{
		$currentSettings = [];
		$sendCookie = true;
	}
}
else
{
	$currentSettings = [];
	$sendCookie = true;
}

if(count(array_diff($currentSettings[0],  $config['location']))) $sendCookie = true;

//Overwrite first setting profile in array with all other settings on server
$currentSettings[0] = $config['location'];

//Load selected profile; make sure cookie is set and not malformed
if(array_key_exists('selectedProfile', $_COOKIE) && is_numeric($_COOKIE['selectedProfile']) && intval($_COOKIE['selectedProfile']) < count($currentSettings)) $selectedProfile = intval($_COOKIE['selectedProfile']);
else
{
	$selectedProfile = 0;
	$sendCookie = true;
}

//Parse settings loaded from cookie for safety reasons
//Implicitly trust server config, for better or worse
if($selectedProfile > 0)
{
	foreach($currentSettings[$selectedProfile] as $key => $value)
	{
		switch($key)
		{
			case "radarCode": case "orig": case "rwrOrig":
				if(!preg_match("/^[A-Z0-9]{5}$/", $value))
				{
					unset($currentSettings[$selectedProfile]);
					$selectedProfile = 0;
					$sendCookie = true;
					break 2;
				}
				break;
			case "stateAbbr":
				if(!preg_match("/^[A-Z]{2}$/", $value))
				{
					unset($currentSettings[$selectedProfile]);
					$selectedProfile = 0;
					$sendCookie = true;
					break 2;
				}
				break;
			case "wxZone":
				if(!preg_match("/^[A-Z]{3}[0-9]{3}$/", $value))
				{
					unset($currentSettings[$selectedProfile]);
					$selectedProfile = 0;
					$sendCookie = true;
					break 2;
				}
				break;
			case "city":
				if(strip_tags($value) != $value)
				{
					unset($currentSettings[$selectedProfile]);
					$selectedProfile = 0;
					$sendCookie = true;
					break 2;
				}
				break;
			case "lat": case "lon":
				if(!is_numeric($value))
				{
					unset($currentSettings[$selectedProfile]);
					$selectedProfile = 0;
					$sendCookie = true;
					break 2;
				}
				break;
			case "timezone":
				if(!in_array($value, timezone_identifiers_list()))
				{
					unset($currentSettings[$selectedProfile]);
					$selectedProfile = 0;
					$sendCookie = true;
					break 2;
				}
				break;
			
			//Prevent injecting variables into the script from the cookie
			default:
				unset($currentSettings[$selectedProfile]);
				$selectedProfile = 0;
				$sendCookie = true;
				break 2;
		}
	}
}

$alertStateAbbrs = "{" . implode(',', array_unique(array($currentSettings[$selectedProfile]['stateAbbr'], substr($currentSettings[$selectedProfile]['orig'], -2), substr($currentSettings[$selectedProfile]['rwrOrig'], -2)))) . "}";

//Save settings in case something changed
if($sendCookie)
{
	setcookie("selectedProfile", "$selectedProfile", time() + 31536000, "/", ".".$_SERVER['SERVER_NAME']);
	setcookie("currentSettings", json_encode(array_values($currentSettings), JSON_UNESCAPED_SLASHES), time() + 31536000, "/", ".".$_SERVER['SERVER_NAME']);
}

//Set the specified timezone
date_default_timezone_set($currentSettings[$selectedProfile]['timezone']);

//Let the fun begin!
if(!array_key_exists('type', $_GET)) die();
if($_GET['type'] == "preload")
{
	$preloadData = [];
	
	$preloadData['localRadarVideo'] = "";
	foreach($config['emwin'] as $value)
	{
		if(explode("*", $value['path'])[1] == "RAD" . $currentSettings[$selectedProfile]['radarCode'] . ".GIF")
		{
			$preloadData['localRadarVideo'] = $value["videoPath"];
			break;
		}
	}
	
	$abiSlugs = array_keys($config['abi']);
	$mesoSlugs = array_keys($config['meso']);
	$l2Slugs = array_keys($config['l2']);
	$emwinSlugs = array_keys($config['emwin']);
	for($i = 0; $i < count($config['abi']); $i++) unset($config['abi'][$abiSlugs[$i]]['path']);
	for($i = 0; $i < count($config['meso']); $i++) unset($config['meso'][$mesoSlugs[$i]]['path']);
	for($i = 0; $i < count($config['l2']); $i++) unset($config['l2'][$l2Slugs[$i]]['path']);
	for($i = 0; $i < count($config['emwin']); $i++) unset($config['emwin'][$emwinSlugs[$i]]['path']);
	
	$preloadData['abi'] = $config['abi'];
	$preloadData['meso'] = $config['meso'];
	$preloadData['l2'] = $config['l2'];
	$preloadData['emwin'] = $config['emwin'];
	$preloadData['showSysInfo'] = $config['general']['showSysInfo'];
	$preloadData['showGraphs'] = array_key_exists('graphiteAPI', $config['general']);
	$preloadData['showEmwinInfo'] = array_key_exists('emwinPath', $config['general']) &&  is_dir($config['general']['emwinPath']);
	$preloadData['showAdminInfo'] = array_key_exists('adminPath', $config['general']) &&  is_dir($config['general']['adminPath']);
	
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($preloadData);
}
elseif($_GET['type'] == "abiMetadata")
{
	if(!array_key_exists($_GET['id'], $config['abi'])) die();
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(findMetadataABI($config['abi'][$_GET['id']]['path'], $config['abi'][$_GET['id']]['title']));
}
elseif($_GET['type'] == "l2Metadata")
{
	if(!array_key_exists($_GET['id'], $config['l2'])) die();
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(findMetadataABI($config['l2'][$_GET['id']]['path'], $config['l2'][$_GET['id']]['title']));
}
elseif($_GET['type'] == "mesoMetadata")
{
	if(!array_key_exists($_GET['id'], $config['meso'])) die();
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(findMetadataABI($config['meso'][$_GET['id']]['path'], $config['meso'][$_GET['id']]['title']));
}
elseif($_GET['type'] == "emwinMetadata")
{
	if(!array_key_exists($_GET['id'], $config['emwin'])) die();
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(findMetadataEMWIN($config['emwin'][$_GET['id']]['path'], $config['emwin'][$_GET['id']]['title']));
}
elseif($_GET['type'] == "localRadarMetadata")
{
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(findMetadataEMWIN($config['general']['emwinPath']."/*RAD" . $currentSettings[$selectedProfile]['radarCode'] . ".GIF", "Local Composite Weather Radar"));
}
elseif($_GET['type'] == "metadata")
{
	$metadata = [];
	switch($_GET['id'])
	{
		case "packetsContent":
			$tzUrl = urlencode($currentSettings[$selectedProfile]['timezone']);
			$packetOK1hrArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-1hours&tz=$tzUrl&target=stats.packets_ok"))[0]->datapoints;
			$packetOK1dayArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-24hours&tz=$tzUrl&target=stats.packets_ok"))[0]->datapoints;
			$packetDrop1hrArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-1hours&tz=$tzUrl&target=stats.packets_dropped"))[0]->datapoints;
			$packetDrop1dayArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-24hours&tz=$tzUrl&target=stats.packets_dropped"))[0]->datapoints;
			$packetOK1hr = $packetOK1day = $packetDrop1hr = $packetDrop1day = 0;
			
			foreach($packetOK1hrArray as $thisPacket) {$packetOK1hr += $thisPacket[0];}
			foreach($packetOK1dayArray as $thisPacket) {$packetOK1day += $thisPacket[0];}
			foreach($packetDrop1hrArray as $thisPacket) {$packetDrop1hr += $thisPacket[0];}
			foreach($packetDrop1dayArray as $thisPacket) {$packetDrop1day += $thisPacket[0];}
			
			$metadata['description'] = "1 Hour Average: " . round(($packetOK1hr / ($packetOK1hr + $packetDrop1hr)) * 100, 4) . "% OK | 1 Day Average: " . round(($packetOK1day / ($packetOK1day + $packetDrop1day)) * 100, 4) . "% OK";
			$metadata['svg1hr'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&colorList=green%2Cred&fontSize=14&title=HRIT%20Packets%20%2F%20Second%20(1%20Hour)&fgcolor=FFFFFF&lineWidth=2&from=-1hours&tz=$tzUrl&target=alias(stats.packets_ok%2C%22Packets%20OK%22)&target=alias(stats.packets_dropped%2C%22Packets%20Dropped%22)"));
			$metadata['svg1day'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&colorList=green%2Cred&fontSize=14&title=HRIT%20Packets%20%2F%20Second%20(1%20Day)&fgcolor=FFFFFF&lineWidth=2&from=-1days&tz=$tzUrl&target=alias(stats.packets_ok%2C%22Packets%20OK%22)&target=alias(stats.packets_dropped%2C%22Packets%20Dropped%22)"));
			break;
			
		case "viterbiContent":
			$tzUrl = urlencode($currentSettings[$selectedProfile]['timezone']);
			$viterbi1hrArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-1hours&tz=$tzUrl&target=divideSeries(stats_counts.viterbi_errors%2CsumSeries(stats_counts.packets_dropped%2Cstats_counts.packets_ok))"))[0]->datapoints;
			$viterbi1dayArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-1days&tz=$tzUrl&target=divideSeries(stats_counts.viterbi_errors%2CsumSeries(stats_counts.packets_dropped%2Cstats_counts.packets_ok))"))[0]->datapoints;
			$viterbi1hrSum = $viterbi1daySum = 0;
			
			foreach($viterbi1hrArray as $thisPacket) {$viterbi1hrSum += $thisPacket[0];}
			foreach($viterbi1dayArray as $thisPacket) {$viterbi1daySum += $thisPacket[0];}
			
			$metadata['description'] = "1 Hour Average: " . round($viterbi1hrSum / count($viterbi1hrArray), 2) . " | 1 Day Average: " . round($viterbi1daySum / count($viterbi1dayArray), 2);
			$metadata['svg1hr'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Avg%20Viterbi%20Error%20Corrections%20%2F%20Packet%20(1%20Hour)&fontSize=14&lineWidth=2&from=-1hours&hideLegend=true&colorList=red&tz=$tzUrl&target=divideSeries(stats_counts.viterbi_errors%2CsumSeries(stats_counts.packets_dropped%2Cstats_counts.packets_ok))"));
			$metadata['svg1day'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Avg%20Viterbi%20Error%20Corrections%20%2F%20Packet%20(1%20Day)&fontSize=14&lineWidth=2&from=-24hours&hideLegend=true&colorList=red&tz=$tzUrl&target=divideSeries(stats_counts.viterbi_errors%2CsumSeries(stats_counts.packets_dropped%2Cstats_counts.packets_ok))"));
			break;
			
		case "rsContent":
			$tzUrl = urlencode($currentSettings[$selectedProfile]['timezone']);
			$rs1hrArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-1hours&tz=$tzUrl&target=stats.reed_solomon_errors"))[0]->datapoints;
			$rs1dayArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-24hours&tz=$tzUrl&target=stats.reed_solomon_errors"))[0]->datapoints;
			$rs1hrSum = $rs1daySum = 0;
			
			foreach($rs1hrArray as $thisPacket) {$rs1hrSum += $thisPacket[0];}
			foreach($rs1dayArray as $thisPacket) {$rs1daySum += $thisPacket[0];}
			
			$metadata['description'] = "1 Hour Average: " . round($rs1hrSum / count($rs1hrArray), 2) . " | 1 Day Average: " . round($rs1daySum / count($rs1dayArray), 2);
			$metadata['svg1hr'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Reed-Solomon%20Errors%20%2F%20Second%20(1%20Hour)&fontSize=14&lineWidth=2&from=-1hours&hideLegend=true&target=alias(stats.reed_solomon_errors%2C%22Reed%20Solomon%20Errors%20per%20Second%22)&tz=$tzUrl"));
			$metadata['svg1day'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Reed-Solomon%20Errors%20%2F%20Second%20(1%20Day)&fontSize=14&lineWidth=2&hideLegend=true&target=alias(stats.reed_solomon_errors%2C%22Reed%20Solomon%20Errors%20per%20Second%22)&tz=$tzUrl"));
			break;
			
		case "gainContent":
			$tzUrl = urlencode($currentSettings[$selectedProfile]['timezone']);
			$gain1hrArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-1hours&tz=$tzUrl&target=stats.gauges.gain"))[0]->datapoints;
			$gain1dayArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-24hours&tz=$tzUrl&target=stats.gauges.gain"))[0]->datapoints;
			$gain1hrSum = $gain1daySum = 0;
			
			foreach($gain1hrArray as $thisPacket) {$gain1hrSum += $thisPacket[0];}
			foreach($gain1dayArray as $thisPacket) {$gain1daySum += $thisPacket[0];}
			
			$metadata['description'] = "1 Hour Average: " . round($gain1hrSum / count($gain1hrArray), 2) . " | 1 Day Average: " . round($gain1daySum / count($gain1dayArray), 2);
			$metadata['svg1hr'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Gain%20Multiplier%20(1%20Hour)&fontSize=14&lineWidth=2&from=-1hours&hideLegend=true&tz=$tzUrl&colorList=orange&target=stats.gauges.gain"));
			$metadata['svg1day'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Gain%20Multiplier%20(1%20Day)&fontSize=14&lineWidth=2&from=-24hours&hideLegend=true&tz=$tzUrl&colorList=orange&target=stats.gauges.gain"));
			break;
			
		case "freqContent":
			$tzUrl = urlencode($currentSettings[$selectedProfile]['timezone']);
			$freq1hrArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-1hours&tz=$tzUrl&target=stats.gauges.frequency"))[0]->datapoints;
			$freq1dayArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-24hours&tz=$tzUrl&target=stats.gauges.frequency"))[0]->datapoints;
			$freq1hrSum = $freq1daySum = 0;
			
			foreach($freq1hrArray as $thisPacket) {$freq1hrSum += $thisPacket[0];}
			foreach($freq1dayArray as $thisPacket) {$freq1daySum += $thisPacket[0];}
			
			$metadata['description'] = "1 Hour Average: " . round($freq1hrSum / count($freq1hrArray), 2) . " | 1 Day Average: " . round($freq1daySum / count($freq1dayArray), 2);
			$metadata['svg1hr'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Frequency%20Offset%20(1%20Hour)&fontSize=14&lineWidth=2&from=-1hours&hideLegend=true&tz=$tzUrl&target=stats.gauges.frequency&colorList=brown"));
			$metadata['svg1day'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Frequency%20Offset%20(1%20Day)&fontSize=14&lineWidth=2&from=-24hours&hideLegend=true&tz=$tzUrl&target=stats.gauges.frequency&colorList=brown"));
			break;
			
		case "omegaContent":
			$tzUrl = urlencode($currentSettings[$selectedProfile]['timezone']);
			$omega1hrArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-1hours&tz=$tzUrl&target=stats.gauges.omega"))[0]->datapoints;
			$omega1dayArray = json_decode(file_get_contents($config['general']['graphiteAPI']."?format=json&from=-24hours&tz=$tzUrl&target=stats.gauges.omega"))[0]->datapoints;
			$omega1hrSum = $omega1daySum = 0;
			
			foreach($omega1hrArray as $thisPacket) {$omega1hrSum += $thisPacket[0];}
			foreach($omega1dayArray as $thisPacket) {$omega1daySum += $thisPacket[0];}
			
			$metadata['description'] = "1 Hour Average: " . round($omega1hrSum / count($omega1hrArray), 2) . " | 1 Day Average: " . round($omega1daySum / count($omega1dayArray), 2);
			$metadata['svg1hr'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Samples%2FSymbol%20in%20Clock%20Recovery%20(1%20Hour)&fontSize=14&lineWidth=2&from=-1hours&hideLegend=true&tz=$tzUrl&colorList=%23008080&target=stats.gauges.omega"));
			$metadata['svg1day'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&title=Samples%2FSymbol%20in%20Clock%20Recovery%20(1%20Day)&fontSize=14&lineWidth=2&from=-24hours&hideLegend=true&tz=$tzUrl&colorList=%23008080&target=stats.gauges.omega"));
			break;
			
		case "otherEmwin":
			$DateTime = new DateTime("now", new DateTimeZone(date_default_timezone_get()));
			
			if(array_key_exists('emwinPath', $config['general']) &&  is_dir($config['general']['emwinPath']))
			{
				//Space Weather Messages
				$spaceWeatherMessages = glob($config['general']['emwinPath']."/*-{ALT,WAT}*.TXT", GLOB_BRACE);
				usort($spaceWeatherMessages, "sortEMWIN");
				$metadata['spaceWeatherMessages'] = [];
				if(count($spaceWeatherMessages) == 0) $metadata['spaceWeatherMessages'][] = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>No Messages</div>";
				foreach($spaceWeatherMessages as $spaceWeatherMessage) $metadata['spaceWeatherMessages'][] = linesToParagraphs(file($spaceWeatherMessage), 3);
				
				//Radar Outages
				$radarOutages = glob($config['general']['emwinPath']."/*-FTM*$alertStateAbbrs.TXT", GLOB_BRACE);
				usort($radarOutages, "sortEMWIN");
				$metadata['radarOutages'] = [];
				if(count($radarOutages) == 0) $metadata['radarOutages'][] = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>No Messages</div>";
				foreach($radarOutages as $radarOutage) $metadata['radarOutages'][] = linesToParagraphs(file($radarOutage), 3);
				
				//Satellite TLE
				$latestTleFile = findNewestEmwin($config['general']['emwinPath']."/*EPHTWOUS.TXT");
				$latestTleArray = file($latestTleFile);
				$metadata['satelliteTle'] = [];
				for($i = 0; $i < count($latestTleArray); $i += 3) $metadata['satelliteTle'][] = trim($latestTleArray[$i]);
				sort($metadata['satelliteTle']);
				$metadata['satelliteTleDate'] = date("M d, Y Hi", findMetadataEMWIN($latestTleFile, "")[0]['timestamp']) . " " . $DateTime->format('T');
				
				//EMWIN Administrative Alerts
				$adminAlertList = glob($config['general']['emwinPath']."/*-ADA*.TXT");
				usort($adminAlertList, "sortEMWIN");
				$metadata['adminAlerts'] = [];
				if(count($adminAlertList) == 0) $metadata['adminAlerts'][] = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>No Alerts</div>";
				foreach($adminAlertList as $adminAlert) $metadata['adminAlerts'][] = linesToParagraphs(file($adminAlert), 3);
				
				//EMWIN Administrative (Regional)
				$adminRegionalList = glob($config['general']['emwinPath']."/*-ADR*.TXT");
				usort($adminRegionalList, "sortEMWIN");
				$metadata['adminRegional'] = [];
				if(count($adminRegionalList) == 0) $metadata['adminRegional'][] = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>No Alerts</div>";
				foreach($adminRegionalList as $adminRegional) $metadata['adminRegional'][] = linesToParagraphs(file($adminRegional), 4);
				
				//EMWIN License
				$emwinLicenseFile = findNewestEmwin($config['general']['emwinPath']."/*FEEBAC1S.TXT");
				if($emwinLicenseFile == "")
				{
					$metadata['emwinLicense'] = "None Found";
					$metadata['emwinLicenseDate'] = "N/A";
				}
				else
				{
					$metadata['emwinLicense'] = linesToParagraphs(file($emwinLicenseFile), 4);
					$metadata['emwinLicenseDate'] = date("M d, Y Hi", findMetadataEMWIN($emwinLicenseFile, "")[0]['timestamp']) . " " . $DateTime->format('T');
				}
			}
			
			if(array_key_exists('adminPath', $config['general']) &&  is_dir($config['general']['adminPath']))
			{
				//Admin update
				$lastAdminFilename = scandir($config['general']['adminPath'], SCANDIR_SORT_DESCENDING)[0];
				$metadata['latestAdminDate'] = date("M d, Y Hi", strtotime(explode("_", $lastAdminFilename)[0])) . " " . $DateTime->format('T');
				$metadata['latestAdmin'] = str_replace("?", "-", utf8_decode(file_get_contents($config['general']['adminPath']."/$lastAdminFilename")));
			}
			
			break;
			
		case "sysInfo":
			//Kernel Info
			$metadata['osVersion'] = trim(shell_exec("lsb_release -ds"));
			$metadata['kernelVersion'] = php_uname('s') . " " . php_uname('r');
			
			//Uptime
			$uptimeStr = file_get_contents('/proc/uptime');
			$num = floatval($uptimeStr);
			$metadata['uptime'] = str_pad(round(fmod($num, 60)), 2, "0", STR_PAD_LEFT);
			$num = intdiv($num, 60);
			$metadata['uptime'] = str_pad($num % 60, 2, "0", STR_PAD_LEFT) . ":" . $metadata['uptime'];
			$num = intdiv($num, 60);
			$metadata['uptime'] = str_pad($num % 24, 2, "0", STR_PAD_LEFT) . ":" . $metadata['uptime'];
			$metadata['uptime'] = intdiv($num, 24) . " days, " . $metadata['uptime'];
			
			//goestools info
			$metadata['goestoolsVersion'] = explode(" ", str_replace("goesrecv -- ", "", explode(PHP_EOL, shell_exec("goesrecv --version"))[0]))[0];
			$metadata['goesrecvStatus'] = ucfirst(trim(shell_exec("systemctl show -p SubState --value goesrecv")));
			$metadata['goesprocStatus'] = ucfirst(trim(shell_exec("systemctl show -p SubState --value goesproc")));
			
			//CPU Load
			$loadAvg = sys_getloadavg();
			$metadata['cpuLoad'] = $loadAvg[0] . ", " . $loadAvg[1] . ", " . $loadAvg[2];
			
			//Memory Usage
			$memFile = fopen('/proc/meminfo','r');
			$memTotal = 0;
			$memAvailable = 0;
			while ($line = fgets($memFile))
			{
				$memPieces = [];
				if (preg_match('/^MemTotal:\s+(\d+)\skB$/', $line, $memPieces)) $memTotal = $memPieces[1];
				if (preg_match('/^MemAvailable:\s+(\d+)\skB$/', $line, $memPieces)) $memAvailable = $memPieces[1];
			}
			fclose($memFile);
			$metadata['memUsage'] = round(($memTotal - $memAvailable) / 1048576, 2) . "GB / " . round($memTotal / 1048576, 2) . "GB - " . round((($memTotal - $memAvailable) / $memAvailable) * 100, 2) . "%";
			
			//Disk Usage
			$totalDiskSpace = round(disk_total_space("/") / 1073741824, 2);
			$usedDiskSpace = $totalDiskSpace - round(disk_free_space("/") / 1073741824, 2);
			$metadata['diskUsage'] = $usedDiskSpace . "GB / " . $totalDiskSpace . "GB  - " . round(($usedDiskSpace / $totalDiskSpace) * 100, 2) . "%";
			
			//Power Status
			$metadata['powerStatus'] = (file_get_contents("/sys/class/power_supply/AC/online") == 1 ? "Plugged In" : "<span style='color: red;'>Unplugged</span>");
			
			//Battery
			if(file_exists("/sys/class/power_supply/BAT0/capacity")) $metadata['batteryPercentage'] = trim(file_get_contents("/sys/class/power_supply/BAT0/capacity"));
			
			//System Temps
			$tempdata = JSON_decode(shell_exec("sensors -j"));
			$metadata['cpuPackage'] = $tempdata->{'coretemp-isa-0000'}->{'Package id 0'}->temp1_input;
			$metadata['core0'] = $tempdata->{'coretemp-isa-0000'}->{'Core 0'}->temp2_input;
			$metadata['core1'] = $tempdata->{'coretemp-isa-0000'}->{'Core 1'}->temp3_input;
			$metadata['core2'] = $tempdata->{'coretemp-isa-0000'}->{'Core 2'}->temp4_input;
			$metadata['core3'] = $tempdata->{'coretemp-isa-0000'}->{'Core 3'}->temp5_input;
			$metadata['wifi'] = $tempdata->{'iwlwifi_1-virtual-0'}->temp1->temp1_input;
			$metadata['fan'] = $tempdata->{'dell_smm-virtual-0'}->{'Processor Fan'}->fan1_input;
			$metadata['chipset'] = $tempdata->{'pch_skylake-virtual-0'}->temp1->temp1_input;
			break;
			
		default:
			die();
			break;
	}
	
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($metadata);
}
elseif($_GET['type'] == "abiData")
{
	if(!array_key_exists($_GET['id'], $config['abi']) || !array_key_exists('timestamp', $_GET)) die();
	$path = findImageABI($config['abi'][$_GET['id']]['path'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "l2Data")
{
	if(!array_key_exists($_GET['id'], $config['l2']) || !array_key_exists('timestamp', $_GET)) die();
	$path = findImageABI($config['l2'][$_GET['id']]['path'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "mesoData")
{
	if(!array_key_exists($_GET['id'], $config['meso']) || !array_key_exists('timestamp', $_GET)) die();
	$path = findImageABI($config['meso'][$_GET['id']]['path'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "emwinData")
{
	if(!array_key_exists($_GET['id'], $config['emwin']) || !array_key_exists('timestamp', $_GET)) die();
	$path = findSpecificEMWIN($config['emwin'][$_GET['id']]['path'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "localRadarData")
{
	if(!array_key_exists('timestamp', $_GET)) die();
	$path = findSpecificEMWIN($config['general']['emwinPath']."/*RAD" . $currentSettings[$selectedProfile]['radarCode'] . ".GIF", $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "tle")
{
	$path = findNewestEmwin($config['general']['emwinPath']."/*EPHTWOUS.TXT");
	header("Pragma: no-cache");
	header('Content-Type: ' . mime_content_type($path));
	header("Cache-Control: max-age=0, no-cache, no-store, must-revalidate");
	header("Expires: Thu, 01 Jan 1970 00:00:01 GMT");
	header('Content-Disposition: attachment; filename=weather.txt');
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "settings")
{
	if($_GET['dropdown'] == "") die();
	$dropdownList = [];
	switch($_GET['dropdown'])
	{
		case "general":
			//Radar Regions
			$allRadarImages = glob($config['general']['emwinPath']."/*-RAD*.GIF");
			$dropdownList['radar'] = $dropdownList['stateAbbr'] = $dropdownList['orig'] = $dropdownList['rwrOrig'] = $dropdownList['timezone'] = $allOrig = $allRwrOrig = [];
			foreach($allRadarImages as $radarImage) $dropdownList['radar'][] = substr($radarImage, -9, 5);
			$dropdownList['radar'] = array_unique($dropdownList['radar']);
			sort($dropdownList['radar']);
			
			//State Abbreviations and Originators
			$allZfp = glob($config['general']['emwinPath']."/*-ZFP*.TXT");
			foreach($allZfp as $zfp)
			{
				$dropdownList['stateAbbr'][] = substr($zfp, -6, 2);
				$allOrig[] = substr($zfp, -9, 5);
			}
			$dropdownList['stateAbbr'] = array_unique($dropdownList['stateAbbr']);
			sort($dropdownList['stateAbbr']);
			
			$allOrig = array_unique($allOrig);
			foreach($allOrig as $thisOrig) $dropdownList['orig'][] = array("state" => substr($thisOrig, 3, 2), "orig" => substr($thisOrig, 0, 3));
			usort($dropdownList['orig'], "sortOrig");
			
			//State Abbreviations and Originators - Regional Weather Roundup
			$allRwr = glob($config['general']['emwinPath']."/*-RWR*.TXT");
			foreach($allRwr as $rwr)
			{
				$dropdownList['stateAbbr'][] = substr($rwr, -6, 2);
				$allRwrOrig[] = substr($rwr, -9, 5);
			}
			$dropdownList['stateAbbr'] = array_unique($dropdownList['stateAbbr']);
			sort($dropdownList['stateAbbr']);
			
			$allRwrOrig = array_unique($allRwrOrig);
			foreach($allRwrOrig as $thisOrig) $dropdownList['rwrOrig'][] = array("state" => substr($thisOrig, 3, 2), "orig" => substr($thisOrig, 0, 3));
			usort($dropdownList['rwrOrig'], "sortOrig");
			
			//Timezones
			$dropdownList['timezone'] = DateTimeZone::listIdentifiers(DateTimeZone::AMERICA | DateTimeZone::ATLANTIC | DateTimeZone::PACIFIC);
			sort($dropdownList['timezone']);
			break;
			
		case "wxZone":
			if(!preg_match("/^[A-Z0-9]{5}$/", $_GET['orig'])) break;
			$localZfpPath = findNewestEMWIN($config['general']['emwinPath']."/*-ZFP" . $_GET['orig'] . ".TXT");
			if($localZfpPath == "") break;
			
			$localZfpArr = file($localZfpPath);
			$i = 0;
			foreach($localZfpArr as $thisLine)
			{
				if(preg_match("/^[A-Z]{3}[0-9]{3}/", $thisLine))
				{
					$dropdownList[] = array("wxZone" => substr($thisLine, 0, 6), "city" => "");
					$j = $i + 1;
					while(!is_numeric($localZfpArr[$j][0]))
					{
						$dropdownList[count($dropdownList) - 1]["city"] .= str_replace(array("-", "..."), ", ", $localZfpArr[$j]);
						$j++;
					}
				}
				
				$i++;
			}
			
			for($i = 0; $i < count($dropdownList); $i++) $dropdownList[$i]["city"] = trim($dropdownList[$i]["city"], " ,\n\r\t\v\x00");
			usort($dropdownList, "sortByCity");
			break;
			
		case "city":
			if(!preg_match("/^[A-Z0-9]{5}$/", $_GET['rwrOrig'])) break;
			$localRwrPath = findNewestEMWIN($config['general']['emwinPath']."/*-RWR" . $_GET['rwrOrig'] . ".TXT");
			if($localRwrPath == "") break;
			
			$localRwrArr = file($localRwrPath);
			$currentlyDecoding = false;
			foreach($localRwrArr as $thisLine)
			{
				if(stripos($thisLine, "CITY") === 0)
				{
					$currentlyDecoding = true;
					continue;
				}
				if(stripos($thisLine, "$$") === 0)
				{
					$currentlyDecoding = false;
					continue;
				}
				if(trim($thisLine) == "" || stripos($thisLine, "...") === 0) continue;
				
				if($currentlyDecoding) $dropdownList[] = trim(preg_replace("/[^A-Za-z0-9 \-.]/", "", substr($thisLine, 0, 15)));
			}
			
			sort($dropdownList);
			break;
			
		default:
			break;
	}
	
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($dropdownList);
}
elseif($_GET['type'] == "alertJSON")
{
	$returnData = [];
	
	//Local Area Emergency
	$localEmergencies = glob($config['general']['emwinPath']."/*-LAE*$alertStateAbbrs.TXT", GLOB_BRACE);
	$returnData['localEmergencies'] = [];
	foreach($localEmergencies as $localEmergency) $returnData['localEmergencies'][] = linesToParagraphs(file($localEmergency), 4);
	
	//Blue Alert
	$blueAlerts = glob($config['general']['emwinPath']."/*-BLU*$alertStateAbbrs.TXT", GLOB_BRACE);
	$returnData['blueAlerts'] = [];
	foreach($blueAlerts as $blueAlert) $returnData['blueAlerts'][] = linesToParagraphs(file($blueAlert), 4);
	
	//Amber Alert
	$amberAlerts = glob($config['general']['emwinPath']."/*-CAE*$alertStateAbbrs.TXT", GLOB_BRACE);
	$returnData['amberAlerts'] = [];
	foreach($amberAlerts as $amberAlert) $returnData['amberAlerts'][] = linesToParagraphs(file($amberAlert), 4);
	
	//Civil Danger Warning
	$civilDangerWarnings = glob($config['general']['emwinPath']."/*-CDW*$alertStateAbbrs.TXT", GLOB_BRACE);
	$returnData['civilDangerWarnings'] = [];
	foreach($civilDangerWarnings as $civilDangerWarning) $returnData['civilDangerWarnings'][] = linesToParagraphs(file($civilDangerWarning), 4);
	
	//Local Evacuations
	$localEvacuations = glob($config['general']['emwinPath']."/*-EVI*$alertStateAbbrs.TXT", GLOB_BRACE);
	$returnData['localEvacuations'] = [];
	foreach($localEvacuations as $localEvacuation) $returnData['localEvacuations'][] = linesToParagraphs(file($localEvacuation), 4);
	
	//Local Weather Warnings
	$weatherWarnings = glob($config['general']['emwinPath']."/*-{SQW,DSW,FRW,FFW,FLW,SVR,TOR}" . $currentSettings[$selectedProfile]['orig'] . ".TXT", GLOB_BRACE);
	$returnData['weatherWarnings'] = [];
	foreach($weatherWarnings as $weatherWarning)
	{
		//Parse warning data from file
		$weatherData = file($weatherWarning);
		$messageStart = $messageEnd = 0;
		for($i = 0; $i < count($weatherData); $i++)
		{
			//Get Header Information about weather warning, and beginning of message
			if(strpos($weatherData[$i], "BULLETIN - ") === 0)
			{
				$alertType = trim($weatherData[++$i]);
				$issuingOffice = trim($weatherData[++$i]);
				$issueTime = trim($weatherData[++$i]);
				$messageStart = ++$i + 1;
				continue;
			}
			
			//Get end of message
			if(trim($weatherData[$i]) == "&&")
			{
				$messageEnd = $i - 1;
				continue;
			}
			
			//Get expiry time
			if(strpos($weatherData[$i], "* Until") === 0)
			{
				//Convert issue time to something PHP can understand
				$DateTime = new DateTime("now", new DateTimeZone(date_default_timezone_get()));
				$issueTimeParts = explode(" " . $DateTime->format('T') . " ", $issueTime);
				$issueTimeParts[0] = substr_replace($issueTimeParts[0], ":", -5, 0);
				
				//Convert the expire time to something PHP can understand
				$expireTimeStr = substr_replace(substr(str_replace("* Until ", "", trim($weatherData[$i])), 0, -1), ":", -9, 0);
				$expireTime = strtotime($expireTimeStr, strtotime($issueTimeParts[1]." ".$issueTimeParts[0]));
			}
			
			//Get geofencing of warning
			if(strpos($weatherData[$i], "LAT...LON") === 0)
			{
				$nextString = trim(str_replace("LAT...LON", "", $weatherData[$i]));
				$geoLat = [];
				$geoLon = [];
				while(preg_match("/^[0-9]{4} [0-9]{4,5}/", $nextString))
				{
					$cordParts = explode(" ", $nextString);
					for($j = 0; $j < count($cordParts); $j++)
					{
						$geoLat[] = $cordParts[$j] / 100;
						$geoLon[] = -($cordParts[++$j] / 100);
					}
					
					//Get next line of geofence (if any)
					$nextString = trim($weatherData[++$i]);
					if(strpos($nextString, "TIME...MOT...LOC") === 0 || trim($nextString) == "&&") break 2;
				}
			}
		}
		
		//Run checks to see if execution should continue
		if(!isset($expireTime) || time() > $expireTime) continue;
		if(!is_in_polygon(count($geoLat) - 1, $geoLon, $geoLat, $currentSettings[$selectedProfile]['lon'], $currentSettings[$selectedProfile]['lat'])) continue;
		
		//Geolocation and time limits checked out OK; send warning to client
		$returnData['weatherWarnings'][] = "<b>Alert type: </b>$alertType<br />" .
			"<b>Issued By: </b>$issuingOffice<br />" .
			"<b>Issue Time: </b>$issueTime<br />" .
			linesToParagraphs(array_slice($weatherData, $messageStart, $messageEnd - $messageStart + 1), 0);
	}
	
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($returnData);
}
elseif($_GET['type'] == "weatherJSON")
{
	$returnData = [];
	$returnData['city'] = $currentSettings[$selectedProfile]['city'];
	$returnData['state'] = $currentSettings[$selectedProfile]['stateAbbr'];
	
	//Current Weather Conditions
	$data = file(findNewestEMWIN($config['general']['emwinPath']."/*RWR" . $currentSettings[$selectedProfile]['rwrOrig'] . ".TXT"));
	$gotWeatherTime = false;
	foreach($data as $thisLine)
	{
		//The first line that starts with a number is the time of the report
		if(!$gotWeatherTime && is_numeric($thisLine[0]))
		{
			$returnData['weatherTime'] = trim($thisLine);
			$gotWeatherTime = true;
		}
		
		if(strpos($thisLine, $currentSettings[$selectedProfile]['city']) === 0)
		{
			$returnData['weatherDesc'] = trim(substr($thisLine, 15, 10));
			if($returnData['weatherDesc'] == "NOT AVBL")
			{
				$returnData['weatherDesc'] = "Not Available";
				$returnData['temp'] = "N/A";
				$returnData['dewPoint'] = "N/A";
				$returnData['humidity'] = "N/A";
				$returnData['pressure'] = "N/A";
				$returnData['remarks'] = "N/A";
				$returnData['wind'] = "N/A";
				$returnData['windGust'] = "N/A";
				$returnData['windDirection'] = "N/A";
				break;
			}
			
			$returnData['temp'] = trim(substr($thisLine, 25, 4));
			$returnData['dewPoint'] = trim(substr($thisLine, 29, 2));
			$returnData['humidity'] = trim(substr($thisLine, 32, 3));
			$returnData['pressure'] = trim(substr($thisLine, 46, 6));
			$returnData['remarks'] = trim(substr($thisLine, 53));
			
			$windPart = trim(substr($thisLine, 36, 10));
			if($windPart == "CALM")
			{
				$returnData['wind'] = 0;
				$returnData['windGust'] = 0;
				$returnData['windDirection'] = "";
			}
			else
			{
				$windParts = str_split($windPart);
				$returnData['windDirection'] = "";
				
				if(is_numeric($windParts[1]))
				{
					$returnData['windDirection'] = substr($windPart, 0, 1);
					$noGust = explode("G", substr($windPart, 1));
					$returnData['wind'] = $noGust[0];
				}
				else
				{
					$returnData['windDirection'] = substr($windPart, 0, 2);
					$noGust = explode("G", substr($windPart, 2));
					$returnData['wind'] = $noGust[0];
				}
				
				if(count($noGust) == 1) $returnData['windGust'] = "N/A";
				else $returnData['windGust'] = $noGust[1] . " MPH";
				
			}
			
			break;
		}
	}
	
	//Regional Weather Summary, or current conditions in Area Forecast Discussion
	$dataPath = findNewestEMWIN($config['general']['emwinPath']."/*RWS" . $currentSettings[$selectedProfile]['orig'] . ".TXT");
	if($dataPath == "")
	{
		$data = file(findNewestEMWIN($config['general']['emwinPath']."/*AFD" . $currentSettings[$selectedProfile]['orig'] . ".TXT"));
		$dataBuffer = [];
		$decodingLine = -1;
		foreach($data as $rawLine)
		{
			$thisLine = trim($rawLine);
			if(stripos($thisLine, ".DISCUSSION...") === 0 || stripos($thisLine, ".NEAR TERM") === 0 || stripos($thisLine, ".SHORT TERM") === 0)
			{
				$decodingLine = 0;
				$dataBuffer[] = substr($thisLine, strrpos($thisLine, "...") + 3);
				continue;
			}
			if($decodingLine == -1) continue;
			if(strpos($thisLine, "&&") === 0) break;
			
			if($decodingLine > 0) $dataBuffer[] = $thisLine;
			else $dataBuffer[0] .= " ".$thisLine;
			$decodingLine++;
		}
		
		$returnData['summaryTime'] = trim($data[5]);
		$returnData['summary'] = linesToParagraphs($dataBuffer, 0);
	}
	else
	{
		$data = file($dataPath);
		$returnData['summaryTime'] = trim($data[7]);
		$returnData['summary'] = linesToParagraphs($data, 9);
	}
	
	//7-day Forecast
	$forcastData = [];
	$decodingLine = -1;
	$data = file(findNewestEMWIN($config['general']['emwinPath']."/*PFM" . $currentSettings[$selectedProfile]['orig'] . ".TXT"));
	
	foreach($data as $rawLine)
	{
		$thisLine = trim($rawLine);
		if(strpos($thisLine, $currentSettings[$selectedProfile]['wxZone']) === 0)
		{
			$decodingLine = 0;
			continue;
		}
		if($decodingLine == -1) continue;
		if(strpos($thisLine, "$$") === 0) break;
		
		$forcastData[] = $thisLine;
	}
	
	//Check if data was found in this file. If not, switch to AFM
	if($decodingLine == -1)
	{
		$data = file(findNewestEMWIN($config['general']['emwinPath']."/*AFM" . $currentSettings[$selectedProfile]['orig'] . ".TXT"));
		foreach($data as $rawLine)
		{
			$thisLine = trim($rawLine);
			if(strpos($thisLine, $currentSettings[$selectedProfile]['wxZone']) === 0)
			{
				$decodingLine = 0;
				continue;
			}
			if($decodingLine == -1) continue;
			if(strpos($thisLine, "$$") === 0) break;
			
			$forcastData[] = $thisLine;
		}
	}
	
	$returnData['sevenDayForcast'] = $forecastClouds = $forecastRh = $forecastDewpt = $forecastLTBreaks = $forecastMinMax = $forecastTemp = $forecastPop = [];
	$dateLine = $returnData['sevenDayForecastDate'] = "";
	$dayMode = true;
	$skippedTemp = false;
	
	foreach($forcastData as $thisLine)
	{
		//Get Date Line (first line that starts with a number (the time), but does not contain a decimal (Lat/Lon)
		if($returnData['sevenDayForecastDate'] == "" && is_numeric($thisLine[0]) && !stripos($thisLine, ".")) $returnData['sevenDayForecastDate'] = $thisLine;
		
		//Get Date Line
		if(stripos($thisLine, "Date") === 0 && $dateLine == "") $dateLine = $thisLine;
		
		//Find breaks between days in days 4-7 forecast (used by parser)
		//This will always run before parsing data in days 4-7
		if(stripos($thisLine, "UTC 6hrly") === 0)
		{
			$breakCheckPoint = 13;
			while($breakCheckPoint < strlen($thisLine))
			{
				$findNextBreak = strpos($thisLine, "  ", $breakCheckPoint);
				if($findNextBreak === false) break;
				
				$forecastLTBreaks[] = $findNextBreak;
				$breakCheckPoint = $findNextBreak + 2;
			}
			
			rsort($forecastLTBreaks);
		}
		
		//Daily High/Low Temp
		if(stripos($thisLine, "Max/Min") === 0 || stripos($thisLine, "Min/Max") === 0)
		{
			if(count($forecastMinMax) == 0 && stripos($thisLine, "Min/Max") === 0) $dayMode = false;
			$forecastMinMax = array_merge($forecastMinMax, parseFmLine($thisLine, $forecastLTBreaks));
		}
		
		//Clouds
		if(stripos($thisLine, "Clouds") === 0) $forecastClouds = parseFmLine($thisLine, $forecastLTBreaks);
		if(stripos($thisLine, "Avg Clouds") === 0) $forecastClouds = array_merge($forecastClouds, parseFmLine($thisLine, $forecastLTBreaks));
		
		//Probability of Precipitation
		if(strpos($thisLine, "PoP 12hr") === 0) $forecastPop = array_merge($forecastPop, parseFmLine($thisLine, $forecastLTBreaks));
		
		//Relative Humidity and Dewpoint (for calculating RH in days 4-7)
		if(stripos($thisLine, "RH") === 0) $forecastRh = parseFmLine($thisLine, $forecastLTBreaks);
		if(stripos($thisLine, "Dewpt") === 0 && count($forecastRh) > 0) $forecastDewpt = parseFmLine($thisLine, $forecastLTBreaks);
		
		//6-Hour Temps (Days 4-7 for calculating RH Only)
		if(strpos($thisLine, "Temp") === 0)
		{
			if($skippedTemp) $forecastTemp = parseFmLine($thisLine, $forecastLTBreaks);
			$skippedTemp = !$skippedTemp;
		}
	}
		
	//Calculate Relative Humidity for Days 4-7
	for($i = 0; $i < count($forecastDewpt); $i++) $forecastRh[] = round(100 * (exp(($forecastDewpt[$i] * 17.625) / ($forecastDewpt[$i] + 243.04)) / exp(($forecastTemp[$i] * 17.625) / ($forecastTemp[$i] + 243.04))));
	
	//Load parsed data into return data array
	$onDay = 0;
	for($i = 0; $i < count($forecastMinMax); $i++)
	{
		if($forecastPop[$i] == "") continue;
		
		if($onDay == count($returnData['sevenDayForcast'])) $returnData['sevenDayForcast'][] = [];
		if($dayMode)
		{
			$returnData['sevenDayForcast'][$onDay]['maxTemp'] = $forecastMinMax[$i];
			$returnData['sevenDayForcast'][$onDay]['amPrecip'] = $forecastPop[$i];
			$returnData['sevenDayForcast'][$onDay]['amClouds'] = $forecastClouds[$i];
			$returnData['sevenDayForcast'][$onDay]['amHumidity'] = $forecastRh[$i];
		}
		
		else
		{
			$returnData['sevenDayForcast'][$onDay]['minTemp'] = $forecastMinMax[$i];
			$returnData['sevenDayForcast'][$onDay]['pmPrecip'] = $forecastPop[$i];
			$returnData['sevenDayForcast'][$onDay]['pmClouds'] = $forecastClouds[$i];
			$returnData['sevenDayForcast'][$onDay]['pmHumidity'] = $forecastRh[$i];
		}
		
		if(!$dayMode) $onDay++;
		$dayMode = !$dayMode;
	}
	
	//Get Days in Forecast
	for($i = 0; $i < count($returnData['sevenDayForcast']); $i++) $returnData['sevenDayForcast'][$i]['date'] = date("l, M j", strtotime("+$i day", strtotime(preg_split("/\s{2,}/", $dateLine)[1])));
	
	//Text Forecast
	$data = file(findNewestEMWIN($config['general']['emwinPath']."/*ZFP" . $currentSettings[$selectedProfile]['orig'] . ".TXT"));
	$returnData['alert'] = "";
	$returnData['forecast'] = [];
	$decodingLine = -1;
	$gettingAlert = false;
	foreach($data as $rawLine)
	{
		$thisLine = trim($rawLine);
		if(strpos($thisLine, $currentSettings[$selectedProfile]['wxZone']) === 0)
		{
			$decodingLine = 0;
			continue;
		}
		if($decodingLine == -1) continue;
		if(strpos($thisLine, "$$") === 0 || strpos($thisLine, "&&") === 0) break;
		
		$decodingLine++;
		
		if(!array_key_exists("forecastTime", $returnData))
		{
			if(is_numeric($thisLine[0])) $returnData['forecastTime'] = $thisLine;
			continue;
		}
		
		if(strpos($thisLine, "...") === 0)
		{
			if(substr($thisLine, -3) == "...")
			{
				$returnData['alert'] = str_replace("...", "", $thisLine);
			}
			else
			{
				$gettingAlert = true;
				$returnData['alert'] = substr($thisLine, 3);
			}
		}
		elseif(strpos($thisLine, ".") === 0)
		{
			$newForecast = explode("...", $thisLine);
			$lastForecastName = ucfirst(strtolower(substr($newForecast[0], 1)));
			$returnData['forecast'][$lastForecastName] = $newForecast[1];
		}
		else
		{
			if($gettingAlert)
			{
				if(strpos($thisLine, "...") === false) $returnData['alert'] .= " ".$thisLine;
				else
				{
					$gettingAlert = false;
					$returnData['alert'] .= " ".substr($thisLine, 0, strlen($thisLine) - 3);
				}
			}
			elseif($thisLine != "")
			{
				$returnData['forecast'][$lastForecastName] .= " ".$thisLine;
			}
		}
	}
	
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($returnData);
}
else die();
?>
