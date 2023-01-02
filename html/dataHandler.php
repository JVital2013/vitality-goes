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

//Load External Functions
require_once($_SERVER['DOCUMENT_ROOT'] . "/functions.php");
$config = loadConfig();

//Only display errors if set to in the config
ini_set("display_errors", ($config['general']['debug'] ? "On" : "Off"));

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

//Overwrite first setting profile in array with all other settings on server
if(count($currentSettings) == 0 || count(array_diff($config['location'], $currentSettings[0])) != 0) $sendCookie = true;
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
		if($value['path'] == "RAD" . $currentSettings[$selectedProfile]['radarCode'] . ".GIF" && isset($value["videoPath"]))
		{
			$preloadData['localRadarVideo'] = $value["videoPath"];
			break;
		}
	}
	
	$abiSlugs = array_keys($config['abi']);
	$mesoSlugs = array_keys($config['meso']);
	$l2Slugs = array_keys($config['l2']);
	$emwinSlugs = array_keys($config['emwin']);
	for($i = 0; $i < count($config['abi']); $i++)
	{
		unset($config['abi'][$abiSlugs[$i]]['path']);
		unset($config['abi'][$abiSlugs[$i]]['filter']);
	}
	for($i = 0; $i < count($config['meso']); $i++)
	{
		unset($config['meso'][$mesoSlugs[$i]]['path']);
		unset($config['meso'][$mesoSlugs[$i]]['filter']);
	}
	for($i = 0; $i < count($config['l2']); $i++)
	{
		unset($config['l2'][$l2Slugs[$i]]['path']);
		unset($config['l2'][$l2Slugs[$i]]['filter']);
	}
	for($i = 0; $i < count($config['emwin']); $i++)
	{
		unset($config['emwin'][$emwinSlugs[$i]]['path']);
		unset($config['emwin'][$emwinSlugs[$i]]['filter']);
	}
	
	$preloadData['abi'] = $config['abi'];
	$preloadData['meso'] = $config['meso'];
	$preloadData['l2'] = $config['l2'];
	$preloadData['emwin'] = $config['emwin'];
	$preloadData['showSysInfo'] = $config['general']['showSysInfo'];
	$preloadData['showSatdumpInfo'] = array_key_exists('satdumpAPI', $config['general']);
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
	echo json_encode(findMetadataABI($config['abi'][$_GET['id']]['path'], $config['abi'][$_GET['id']]['filter'], $config['abi'][$_GET['id']]['title']));
}
elseif($_GET['type'] == "l2Metadata")
{
	if(!array_key_exists($_GET['id'], $config['l2'])) die();
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(findMetadataABI($config['l2'][$_GET['id']]['path'], $config['l2'][$_GET['id']]['filter'], $config['l2'][$_GET['id']]['title']));
}
elseif($_GET['type'] == "mesoMetadata")
{
	if(!array_key_exists($_GET['id'], $config['meso'])) die();
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(findMetadataABI($config['meso'][$_GET['id']]['path'], $config['meso'][$_GET['id']]['filter'], $config['meso'][$_GET['id']]['title']));
}
elseif($_GET['type'] == "emwinMetadata")
{
	if(!array_key_exists($_GET['id'], $config['emwin'])) die();
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(findMetadataEMWIN(scandir_recursive($config['general']['emwinPath']), $config['emwin'][$_GET['id']]['path'], $config['emwin'][$_GET['id']]['title']));
}
elseif($_GET['type'] == "metadata")
{
	$metadata = [];
	switch($_GET['id'])
	{
		case "packetsContent":
			set_error_handler("convertToException");
			try
			{
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
				$metadata['svg1hr'] = preg_replace("(clip-path.*clip-rule.*\")", "",
					file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&colorList=green%2Cred&fontSize=14&title=HRIT%20Packets%20%2F%20Second%20(1%20Hour)&fgcolor=FFFFFF&lineWidth=2&from=-1hours&tz=$tzUrl&target=alias(stats.packets_ok%2C%22Packets%20OK%22)&target=alias(stats.packets_dropped%2C%22Packets%20Dropped%22)"));
				$metadata['svg1day'] = preg_replace("(clip-path.*clip-rule.*\")", "",
					file_get_contents($config['general']['graphiteAPI']."?width=600&height=350&format=svg&colorList=green%2Cred&fontSize=14&title=HRIT%20Packets%20%2F%20Second%20(1%20Day)&fgcolor=FFFFFF&lineWidth=2&from=-1days&tz=$tzUrl&target=alias(stats.packets_ok%2C%22Packets%20OK%22)&target=alias(stats.packets_dropped%2C%22Packets%20Dropped%22)"));
			}
			catch(exception $e)
			{
				$metadata = [];
			}
			restore_error_handler();
			break;
			
		case "viterbiContent":
			parseGraphiteData($metadata, $currentSettings[$selectedProfile]['timezone'], $config['general']['graphiteAPI'], "divideSeries(stats_counts.viterbi_errors,sumSeries(stats_counts.packets_dropped,stats_counts.packets_ok))", "Avg Viterbi Error Corrections / Packet", "red");
			break;
			
		case "rsContent":
			parseGraphiteData($metadata, $currentSettings[$selectedProfile]['timezone'], $config['general']['graphiteAPI'], "stats.reed_solomon_errors", "Reed-Solomon Errors / Second", "6464FF");
			break;
			
		case "gainContent":
			parseGraphiteData($metadata, $currentSettings[$selectedProfile]['timezone'], $config['general']['graphiteAPI'], "stats.gauges.gain", "Gain Multiplier", "orange");
			break;
			
		case "freqContent":
			parseGraphiteData($metadata, $currentSettings[$selectedProfile]['timezone'], $config['general']['graphiteAPI'], "stats.gauges.frequency", "Frequency Offset", "brown");
			break;
			
		case "omegaContent":
			parseGraphiteData($metadata, $currentSettings[$selectedProfile]['timezone'], $config['general']['graphiteAPI'], "stats.gauges.omega", "Samples/Symbol in Clock Recovery", "008080");
			break;
			
		case "otherEmwin":
			$DateTime = new DateTime("now", new DateTimeZone(date_default_timezone_get()));
			
			if(array_key_exists('emwinPath', $config['general']) && is_dir($config['general']['emwinPath']))
			{
				//Get all emwin files
				$allEmwinFiles = scandir_recursive($config['general']['emwinPath']);
				
				//Load pertinent pieces of information where for cards with all available information
				$spaceWeatherMessages = $radarOutages = $adminAlertList = $adminRegionalList = [];
				$alertStateAbbrs = "(" . implode('|', array_unique(array($currentSettings[$selectedProfile]['stateAbbr'], substr($currentSettings[$selectedProfile]['orig'], -2), substr($currentSettings[$selectedProfile]['rwrOrig'], -2)))) . ")";
				foreach($allEmwinFiles as $thisFile)
				{
					if(strpos($thisFile, "-ALT") !== false || strpos($thisFile, "-WAT") !== false) $spaceWeatherMessages[] = $thisFile;
					if(preg_match("/-FTM.*$alertStateAbbrs\.TXT$/", $thisFile)) $radarOutages[] = $thisFile;
					if(strpos($thisFile, "-ADA") !== false) $adminAlertList[] = $thisFile;
					if(strpos($thisFile, "-ADR") !== false) $adminRegionalList[] = $thisFile;
				}
				
				//Space Weather Messages
				usort($spaceWeatherMessages, "sortEMWIN");
				$metadata['spaceWeatherMessages'] = [];
				if(count($spaceWeatherMessages) == 0) $metadata['spaceWeatherMessages'][] = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>No Messages</div>";
				foreach($spaceWeatherMessages as $spaceWeatherMessage) $metadata['spaceWeatherMessages'][] = linesToParagraphs(file($spaceWeatherMessage), 3);
				
				//Radar Outages
				usort($radarOutages, "sortEMWIN");
				$metadata['radarOutages'] = [];
				if(count($radarOutages) == 0) $metadata['radarOutages'][] = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>No Messages</div>";
				foreach($radarOutages as $radarOutage) $metadata['radarOutages'][] = linesToParagraphs(file($radarOutage), 3);
				
				//EMWIN Administrative Alerts
				usort($adminAlertList, "sortEMWIN");
				$metadata['adminAlerts'] = [];
				if(count($adminAlertList) == 0) $metadata['adminAlerts'][] = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>No Alerts</div>";
				foreach($adminAlertList as $adminAlert) $metadata['adminAlerts'][] = linesToParagraphs(file($adminAlert), 3);
				
				//EMWIN Administrative (Regional)
				usort($adminRegionalList, "sortEMWIN");
				$metadata['adminRegional'] = [];
				if(count($adminRegionalList) == 0) $metadata['adminRegional'][] = "<div style='text-align: center; font-weight: bold; font-size: 13pt;'>No Alerts</div>";
				foreach($adminRegionalList as $adminRegional) $metadata['adminRegional'][] = linesToParagraphs(file($adminRegional), 4);
				
				//Satellite TLE
				$latestTleFile = findNewestEmwin($allEmwinFiles, "EPHTWOUS");
				$metadata['satelliteTle'] = [];
				if($latestTleFile != "")
				{
					$latestTleArray = file($latestTleFile);
					for($i = 0; $i < count($latestTleArray); $i += 3) $metadata['satelliteTle'][] = trim($latestTleArray[$i]);
					sort($metadata['satelliteTle']);
					$metadata['satelliteTleDate'] = date("M d, Y Hi", findMetadataEMWIN($allEmwinFiles, $latestTleFile, "")[0]['timestamp']) . " " . $DateTime->format('T');
				}
				
				//EMWIN License
				$emwinLicenseFile = findNewestEmwin($allEmwinFiles, "FEEBAC1S");
				if($emwinLicenseFile == "")
				{
					$metadata['emwinLicense'] = "None Found";
					$metadata['emwinLicenseDate'] = "N/A";
				}
				else
				{
					$metadata['emwinLicense'] = linesToParagraphs(file($emwinLicenseFile), 4);
					$metadata['emwinLicenseDate'] = date("M d, Y Hi", findMetadataEMWIN($allEmwinFiles, $emwinLicenseFile, "")[0]['timestamp']) . " " . $DateTime->format('T');
				}
			}
			
			if(array_key_exists('adminPath', $config['general']) &&  is_dir($config['general']['adminPath']))
			{
				//Admin update
				$allAdminFiles = scandir_recursive($config['general']['adminPath']);
				$allAdminFiles = preg_grep("/[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.(txt|TXT)$/", $allAdminFiles);
				usort($allAdminFiles, "sortABI");
				$adminDateParts = explode("_", basename($allAdminFiles[count($allAdminFiles) - 1]));
				$metadata['latestAdminDate'] = DateTimeImmutable::createFromFormat("Y.m.d", substr($adminDateParts[count($adminDateParts) - 1], 0, -4))->format("M d, Y");
				$metadata['latestAdmin'] = str_replace("?", "-", utf8_decode(file_get_contents($allAdminFiles[count($allAdminFiles) - 1])));
			}
			
			break;
			
		case "sysInfo":
			if(!$config['general']['showSysInfo']) die();
			$metadata['sysData'] = [];
			
			//Windows System Info
			if(PHP_OS_FAMILY == "Windows")
			{
				//Windows Version
				$metadata['sysData'][] = array("name" => "Windows Version", "value" => ucfirst(php_uname('v')));
				
				//Get Data from PowerShell
				$powershellData = json_decode(shell_exec("powershell -EncodedCommand " .
					"JABtAGUAbQBvAHIAeQAgAD0AIABnAGMAaQBtACAAdwBpAG4AMwAyAF8AbwBwAGU" .
					"AcgBhAHQAaQBuAGcAcwB5AHMAdABlAG0AIAAtAFAAcgBvAHAAZQByAHQAeQAgAF" .
					"QAbwB0AGEAbABWAGkAcwBpAGIAbABlAE0AZQBtAG8AcgB5AFMAaQB6AGUALABGA" .
					"HIAZQBlAFAAaAB5AHMAaQBjAGEAbABNAGUAbQBvAHIAeQA7ACAAJABiAGEAdAB0" .
					"AGUAcgB5ACAAPQAgAGcAYwBpAG0AIAB3AGkAbgAzADIAXwBiAGEAdAB0AGUAcgB" .
					"5ADsAIAAkAHIAZQB0AFYAYQBsACAAPQAgAEAAewB1AHAAdABpAG0AZQAgAD0AIA" .
					"AkACgAKABnAGUAdAAtAGQAYQB0AGUAKQAgAC0AIAAoAGcAYwBpAG0AIABXAGkAb" .
					"gAzADIAXwBPAHAAZQByAGEAdABpAG4AZwBTAHkAcwB0AGUAbQApAC4ATABhAHMA" .
					"dABCAG8AbwB0AFUAcABUAGkAbQBlACkALgBUAG8AdABhAGwAUwBlAGMAbwBuAGQ" .
					"AcwA7ACAAYwBwAHUATABvAGEAZAAgAD0AIAAkACgAZwBjAGkAbQAgAFcAaQBuAD" .
					"MAMgBfAFAAcgBvAGMAZQBzAHMAbwByACAALQBQAHIAbwBwAGUAcgB0AHkAIABMA" .
					"G8AYQBkAFAAZQByAGMAZQBuAHQAYQBnAGUAKQAuAEwAbwBhAGQAUABlAHIAYwBl" .
					"AG4AdABhAGcAZQA7ACAAbQBlAG0AVABvAHQAYQBsACAAPQAgACQAbQBlAG0AbwB" .
					"yAHkALgBUAG8AdABhAGwAVgBpAHMAaQBiAGwAZQBNAGUAbQBvAHIAeQBTAGkAeg" .
					"BlADsAIABtAGUAbQBBAHYAYQBpAGwAYQBiAGwAZQAgAD0AIAAkAG0AZQBtAG8Ac" .
					"gB5AC4ARgByAGUAZQBQAGgAeQBzAGkAYwBhAGwATQBlAG0AbwByAHkAOwB9ADsA" .
					"IABpAGYAKAAkAGIAYQB0AHQAZQByAHkAIAAtAG4AZQAgACQAbgB1AGwAbAApAHs" .
					"AJAByAGUAdABWAGEAbAAuAEEAZABkACgAIgBwAG8AdwBlAHIAUwB0AGEAdAB1AH" .
					"MAIgAsACAAQAAoADIALAAzACwANgAsADcALAA4ACwAOQApACAALQBjAG8AbgB0A" .
					"GEAaQBuAHMAIAAkAGIAYQB0AHQAZQByAHkALgBCAGEAdAB0AGUAcgB5AFMAdABh" .
					"AHQAdQBzACkAOwAgACQAcgBlAHQAVgBhAGwALgBBAGQAZAAoACIAYgBhAHQAdAB" .
					"lAHIAeQBQAGUAcgBjAGUAbgB0AGEAZwBlACIALAAgACQAYgBhAHQAdABlAHIAeQ" .
					"AuAEUAcwB0AGkAbQBhAHQAZQBkAEMAaABhAHIAZwBlAFIAZQBtAGEAaQBuAGkAb" .
					"gBnACkAOwB9ACAAJAByAGUAdABWAGEAbAAgAHwAIABDAG8AbgB2AGUAcgB0AFQA" .
					"bwAtAEoAUwBPAE4AIAAtAEMAbwBtAHAAcgBlAHMAcwA="));
				
				//Parse data - hand some of it off for later
				if(property_exists($powershellData, "powerStatus"))
					$metadata['sysData'][] = array("name" => "Power Status", "value" => $powershellData->powerStatus ? "Plugged In" : "<span style='color: red;'>Unplugged</span>");
				if(property_exists($powershellData, "batteryPercentage"))
				$metadata['sysData'][] = array("name" => "Battery Percentage", "value" => $powershellData->batteryPercentage . "%");
				$metadata['sysData'][] = array("name" => "CPU Load Average", "value" => $powershellData->cpuLoad . "%");
				$uptimeStr = $powershellData->uptime;
				$memTotal = $powershellData->memTotal;
				$memAvailable = $powershellData->memAvailable;
				
				//Info about running processes (parsed later)
				$runningProcesses = shell_exec("tasklist");
				
				//System temp data on Windows is not supported
				$metadata['tempData'] = [];
			}
			
			//Other Systems (assume Linux-like system)
			else
			{
				//Kernel Info
				$metadata['sysData'][] = array("name" => "OS Version", "value" => trim(shell_exec("lsb_release -ds")));
				$metadata['sysData'][] = array("name" => "Kernel Version", "value" => php_uname('s') . " " . php_uname('r'));
				
				//Uptime
				$uptimeStr = file_get_contents('/proc/uptime');
				
				//CPU Load
				$loadAvg = sys_getloadavg();
				$metadata['sysData'][] = array("name" => "CPU Load (1min, 5min, 15min)", "value" => $loadAvg[0] . ", " . $loadAvg[1] . ", " . $loadAvg[2]);
				
				//Memory Usage (parsed later)
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
				
				//Power Status
				if(file_exists("/sys/class/power_supply/AC/online"))
					$metadata['sysData'][] = array("name" => "Power Status", "value" => file_get_contents("/sys/class/power_supply/AC/online") == 1 ? "Plugged In" : "<span style='color: red;'>Unplugged</span>");
				
				//Battery
				if(file_exists("/sys/class/power_supply/BAT0/capacity"))
					$metadata['sysData'][] = array("name" => "Battery Percentage", "value" => trim(file_get_contents("/sys/class/power_supply/BAT0/capacity")) . "%");
				
				//System Temps
				$hwmonDirs = scandir("/sys/class/hwmon/");
				$metadata['tempData'] = [];
				foreach($hwmonDirs as $thisHwmon)
				{
					if($thisHwmon == "." || $thisHwmon == "..") continue;
					$thisDevicesSensors = glob("/sys/class/hwmon/" . $thisHwmon . "/{temp,fan}*_input", GLOB_BRACE);
					if(count($thisDevicesSensors) == 0) continue;
					
					$tempBaseName = ucfirst(str_replace("_", " ", trim(file_get_contents("/sys/class/hwmon/" . $thisHwmon . "/name"))));
					$tempCount = $fanCount = 1;
					foreach($thisDevicesSensors as $thisSensor)
					{
						$metadata['tempData'][] = [];
						
						if(strpos($thisSensor, "temp") !== false)
						{
							if(file_exists(str_replace("input", "label", $thisSensor))) $thisSensorName = trim(file_get_contents(str_replace("input", "label", $thisSensor))) . " Temp";
							else $thisSensorName = "$tempBaseName Temp" . (count($thisDevicesSensors) > 1 ? " $tempCount" : "");
							
							$metadata['tempData'][count($metadata['tempData']) - 1]['name'] = $thisSensorName;
							
							//Some sensors error when below 0 degrees - catch these errors
							set_error_handler("convertToException");
							try
							{
								$thisSensorData = file_get_contents($thisSensor);
								$metadata['tempData'][count($metadata['tempData']) - 1]['value'] = intval(trim($thisSensorData)) / 1000 . "&deg; C";
							}
							catch (exception $e)
							{
								//Failed; return an error
								$metadata['tempData'][count($metadata['tempData']) - 1]['value'] = "Error!";
							}
							
							//Return to typical error handler
							restore_error_handler();
							$tempCount++;
						}
						
						else
						{
							if(file_exists(str_replace("input", "label", $thisSensor))) $thisSensorName = trim(file_get_contents(str_replace("input", "label", $thisSensor)));
							else $thisSensorName = "$tempBaseName Fan" . (count($thisDevicesSensors) > 1 ? " $fanCount" : "");
							
							$metadata['tempData'][count($metadata['tempData']) - 1]['name'] = $thisSensorName . " Speed";
							$metadata['tempData'][count($metadata['tempData']) - 1]['value'] = trim(file_get_contents($thisSensor)) . " RPM";
							$fanCount++;
						}
					}
				}
				
				//Info about running processes
				$runningProcesses = shell_exec("ps acxo command");
			}
			
			//Disk Usage (all OSs)
			$totalDiskSpace = round(disk_total_space($_SERVER['DOCUMENT_ROOT']) / 1073741824, 2);
			$usedDiskSpace = $totalDiskSpace - round(disk_free_space($_SERVER['DOCUMENT_ROOT']) / 1073741824, 2);
			$metadata['sysData'][] = array("name" => "Disk Used", "value" => $usedDiskSpace . "GB / " . $totalDiskSpace . "GB  - " . round(($usedDiskSpace / $totalDiskSpace) * 100, 2) . "%");
			
			//Memory Usage
			$metadata['sysData'][] = array("name" => "Memory Used", "value" => round(($memTotal - $memAvailable) / 1048576, 2) . "GB / " . round($memTotal / 1048576, 2) . "GB - " . round((($memTotal - $memAvailable) / $memTotal) * 100, 2) . "%");
			
			//Uptime (all OSs)
			$num = floatval($uptimeStr);
			$uptimeStr = str_pad(round(fmod($num, 60)), 2, "0", STR_PAD_LEFT);
			$num = intdiv($num, 60);
			$uptimeStr = str_pad($num % 60, 2, "0", STR_PAD_LEFT) . ":" . $uptimeStr;
			$num = intdiv($num, 60);
			$uptimeStr = str_pad($num % 24, 2, "0", STR_PAD_LEFT) . ":" . $uptimeStr;
			$uptimeStr = intdiv($num, 24) . " days, " . $uptimeStr;
			$metadata['sysData'][] = array("name" => "Uptime", "value" => $uptimeStr);
			
			//Find running satellite decoders (all OSs)
			$noDecoderFound = true;
			if(stripos($runningProcesses, "goesrecv") !== false || stripos($runningProcesses, "goesproc") !== false)
			{
				$noDecoderFound = false;
				$metadata['sysData'][] = array("name" => "Goesrecv Status", "value" => stripos($runningProcesses, "goesrecv") !== false ? "Running" : "<span style='color: red;'>Not Running</span>");
				$metadata['sysData'][] = array("name" => "Goesproc Status", "value" => stripos($runningProcesses, "goesproc") !== false ? "Running" : "<span style='color: red;'>Not Running</span>");
				if(verifyCommand("goesrecv")) $metadata['sysData'][] = array("name" => "Goestools Version", "value" => explode(" ", str_replace("goesrecv -- ", "", explode(PHP_EOL, shell_exec("goesrecv --version"))[0]))[0]);
			}
			if(stripos($runningProcesses, "satdump") !== false)
			{
				$noDecoderFound = false;
				$metadata['sysData'][] = array("name" => "SatDump Status", "value" => "Running");
			}
			if($noDecoderFound) $metadata['sysData'][] = array("name" => "Satellite Decoder", "value" => "None Found!");
			
			//SatDump Statistics (all OSs)
			if(array_key_exists('satdumpAPI', $config['general']))
			{
				$metadata['satdumpData'] = [];
				set_error_handler("convertToException");
				try
				{
					$satdumpStats = json_decode(file_get_contents($config['general']['satdumpAPI']));
				}
				catch(exception $e)
				{
					$satdumpStats = [];
				}
				restore_error_handler();
				
				foreach($satdumpStats as $stat => $value)
				{
					$metadata['satdumpData'][]['title'] = ucwords(str_replace("_", " ", $stat));
					$metadata['satdumpData'][count($metadata['satdumpData']) - 1]['values'] = [];
					foreach($value as $subName => $subValue)
					{
						if(is_float($subValue)) $valToUse = round($subValue, 5);
						elseif(is_bool($subValue)) $valToUse = $subValue ? "True" : "False";
						else $valToUse = $subValue;
						$metadata['satdumpData'][count($metadata['satdumpData']) - 1]['values'][] = array("name" => ucwords(str_replace("_", " ", $subName)), "value" => $valToUse);
					}
				}
			}
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
	$path = findImageABI($config['abi'][$_GET['id']]['path'], $config['abi'][$_GET['id']]['filter'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Disposition: inline; filename=' . basename($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "l2Data")
{
	if(!array_key_exists($_GET['id'], $config['l2']) || !array_key_exists('timestamp', $_GET)) die();
	$path = findImageABI($config['l2'][$_GET['id']]['path'], $config['l2'][$_GET['id']]['filter'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Disposition: inline; filename=' . basename($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "mesoData")
{
	if(!array_key_exists($_GET['id'], $config['meso']) || !array_key_exists('timestamp', $_GET)) die();
	$path = findImageABI($config['meso'][$_GET['id']]['path'], $config['meso'][$_GET['id']]['filter'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Disposition: inline; filename=' . basename($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "hurricaneData")
{
	if(!array_key_exists('timestamp', $_GET) || !array_key_exists('id', $_GET) || preg_match("/^[A-Z0-9]{2}$/", $_GET['id']) == 0 
		|| !array_key_exists('product', $_GET) || preg_match("/^[A-Z0-9]{6}$/", $_GET['product']) == 0) die();
		
	$path = findSpecificEMWIN(scandir_recursive($config['general']['emwinPath']), $_GET['product'].$_GET['id'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Disposition: inline; filename=' . basename($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "emwinData")
{
	if(!array_key_exists($_GET['id'], $config['emwin']) || !array_key_exists('timestamp', $_GET)) die();
	$path = findSpecificEMWIN(scandir_recursive($config['general']['emwinPath']), $config['emwin'][$_GET['id']]['path'], $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Disposition: inline; filename=' . basename($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "localRadarData")
{
	if(!array_key_exists('timestamp', $_GET)) die();
	$path = findSpecificEMWIN(scandir_recursive($config['general']['emwinPath']), "RAD" . $currentSettings[$selectedProfile]['radarCode'] . ".GIF", $_GET['timestamp']);
	header('Content-Type: ' . mime_content_type($path));
	header('Content-Disposition: inline; filename=' . basename($path));
	header('Content-Length: ' . filesize($path));
	readfile($path);
}
elseif($_GET['type'] == "tle")
{
	$path = findNewestEmwin(scandir_recursive($config['general']['emwinPath']), "EPHTWOUS");
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
			//Query all emwin files
			$allEmwinFiles = scandir_recursive($config['general']['emwinPath']);
			
			//Find pertinent data in emwin files
			$dropdownList['radar'] = $dropdownList['stateAbbr'] = $dropdownList['orig'] = $dropdownList['rwrOrig'] = $dropdownList['timezone'] = $allOrig = $allRwrOrig = [];
			foreach($allEmwinFiles as $thisFile)
			{
				if(strpos($thisFile, "-RAD") !== false) $dropdownList['radar'][] = substr($thisFile, -9, 5);
				if(strpos($thisFile, "-ZFP") !== false)
				{
					$dropdownList['stateAbbr'][] = substr($thisFile, -6, 2);
					$allOrig[] = substr($thisFile, -9, 5);
				}
				if(strpos($thisFile, "-RWR") !== false)
				{
					$dropdownList['stateAbbr'][] = substr($thisFile, -6, 2); //Probably redundant
					$allRwrOrig[] = substr($thisFile, -9, 5);
				}
			}
			
			//Distill information from EMWIN files into user menus
			$dropdownList['radar'] = array_unique($dropdownList['radar']);
			$dropdownList['stateAbbr'] = array_unique($dropdownList['stateAbbr']);
			$allOrig = array_unique($allOrig);
			$allRwrOrig = array_unique($allRwrOrig);
			sort($dropdownList['radar']);
			sort($dropdownList['stateAbbr']);
			
			//Additional Processing for Product Office Listings
			foreach($allOrig as $thisOrig) $dropdownList['orig'][] = array("state" => substr($thisOrig, 3, 2), "orig" => substr($thisOrig, 0, 3));
			foreach($allRwrOrig as $thisOrig) $dropdownList['rwrOrig'][] = array("state" => substr($thisOrig, 3, 2), "orig" => substr($thisOrig, 0, 3));
			usort($dropdownList['rwrOrig'], "sortOrig");
			usort($dropdownList['orig'], "sortOrig");
			
			//Timezones
			$dropdownList['timezone'] = DateTimeZone::listIdentifiers(DateTimeZone::AMERICA | DateTimeZone::ATLANTIC | DateTimeZone::PACIFIC);
			sort($dropdownList['timezone']);
			break;
			
		case "wxZone":
			if(!preg_match("/^[A-Z0-9]{5}$/", $_GET['orig'])) break;
			$localZfpPath = findNewestEMWIN(scandir_recursive($config['general']['emwinPath']), "ZFP".$_GET['orig']);
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
			$localRwrPath = findNewestEMWIN(scandir_recursive($config['general']['emwinPath']), "RWR".$_GET['rwrOrig']);
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
				if(strpos($thisLine, "$$") === 0 || stripos($thisLine, "STATION/POSITION") === 0)
				{
					$currentlyDecoding = false;
					continue;
				}
				if(trim($thisLine) == "" || stripos($thisLine, "...") === 0 || stripos($thisLine, "6HR ") === 0) continue;
				
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
	$latestHurricaneMessage = 0;
	$returnData['localEmergencies'] = $returnData['blueAlerts'] = $returnData['amberAlerts'] = $returnData['civilDangerWarnings'] = 
		$returnData['localEvacuations'] = $returnData['hurricaneStatement'] = $returnData['weatherWarnings'] = [];
	
	//Query all emwin files
	$allEmwinFiles = scandir_recursive($config['general']['emwinPath']);
	$alertStateAbbrs = "(" . implode('|', array_unique(array($currentSettings[$selectedProfile]['stateAbbr'], substr($currentSettings[$selectedProfile]['orig'], -2), substr($currentSettings[$selectedProfile]['rwrOrig'], -2)))) . ")";
	
	//Find pertinent data in the EMWIN files
	foreach($allEmwinFiles as $thisFile)
	{
		//Various alerts
		if(preg_match("/-LAE.*$alertStateAbbrs\.TXT$/", $thisFile)) $returnData['localEmergencies'][] = linesToParagraphs(file($thisFile), 4);
		if(preg_match("/-BLU.*$alertStateAbbrs\.TXT$/", $thisFile)) $returnData['blueAlerts'][] = linesToParagraphs(file($thisFile), 4);
		if(preg_match("/-CAE.*$alertStateAbbrs\.TXT$/", $thisFile)) $returnData['amberAlerts'][] = linesToParagraphs(file($thisFile), 4);
		if(preg_match("/-CDW.*$alertStateAbbrs\.TXT$/", $thisFile)) $returnData['civilDangerWarnings'][] = linesToParagraphs(file($thisFile), 4);
		if(preg_match("/-EVI.*$alertStateAbbrs\.TXT$/", $thisFile)) $returnData['localEvacuations'][] = linesToParagraphs(file($thisFile), 4);
		
		//Hurricane Statement - Only get most recent
		if(preg_match("/-HLS.*" . $currentSettings[$selectedProfile]['orig'] . "\.TXT$/", $thisFile))
		{
			$hurricaneStatementLines = file($thisFile);
			foreach($hurricaneStatementLines as $hurricaneStatementLine)
			{
				$thisLine = trim($hurricaneStatementLine);
				if($thisLine != "" && is_numeric($thisLine[0]))
				{
					$DateTime = new DateTime("now", new DateTimeZone(date_default_timezone_get()));
					$issueTimeParts = explode(" " . $DateTime->format('T') . " ", $thisLine);
					$issueTimeParts[0] = substr_replace($issueTimeParts[0], ":", -5, 0);
					$thisHurricaneMessageTime = strtotime($issueTimeParts[1] . " " . $issueTimeParts[0]);
					
					if($thisHurricaneMessageTime > $latestHurricaneMessage)
					{
						$returnData['hurricaneStatement'][0] = linesToParagraphs($hurricaneStatementLines, 4);
						$latestHurricaneMessage = $thisHurricaneMessageTime;
					}
					
					break;
				}
			}
			
		}
		
		//Weather warnings
		if(preg_match("/-(SQW|DSW|FRW|FFW|FLW|SVR|TOR|EWW)" . $currentSettings[$selectedProfile]['orig'] . "\.TXT$/", $thisFile))
		{
			//Parse warning data from file
			$weatherData = file($thisFile);
			$messageStart = $messageEnd = 0;
			for($i = 0; $i < count($weatherData); $i++)
			{
				//Get Header Information about weather warning, and beginning of message
				if(stripos($weatherData[$i], "BULLETIN - ") === 0)
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
				if(stripos($weatherData[$i], "* Until") === 0)
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
				if(stripos($weatherData[$i], "LAT...LON") === 0)
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
						if(stripos($nextString, "TIME...MOT...LOC") === 0 || trim($nextString) == "&&") break 2;
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
	}
	
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($returnData);
}
elseif($_GET['type'] == "hurricaneJSON")
{
	$returnData = [];
	
	if(array_key_exists('emwinPath', $config['general']) && is_dir($config['general']['emwinPath']))
	{
		//Get all hurricane emwin files
		$allEmwinFiles = scandir_recursive($config['general']['emwinPath']);
		foreach($allEmwinFiles as $thisFile)
		{
			//Find Hurricane Imagery
			if(preg_match("/-(AL|EP)[0-9]{2}[A-Z0-9]{2}(5D|WS|RS)\.PNG$/", $thisFile))
			{
				//Skip invalid EMWIN files
				$fileNameParts = explode("_", basename($thisFile));
				if(count($fileNameParts) != 6) continue;
				
				//Get Storm Identifiers
				$lastParts = explode("-", $thisFile);
				$productIdentifier = explode(".", $lastParts[count($lastParts) - 1])[0];
				$stormIdentifier = substr($productIdentifier, 0, -2);
				$imageType = substr($productIdentifier, -2);
				
				//Get date of product
				$DateTime = new DateTime($fileNameParts[4], new DateTimeZone("UTC"));
				$DateTime->setTimezone(new DateTimeZone(date_default_timezone_get()));
				$date = $DateTime->format("F j, Y g:i A");
				
				//First product found for this hurricane; initialize arrays
				if(!isset($returnData[$stormIdentifier])) $returnData[$stormIdentifier] = [];
				if(!isset($returnData[$stormIdentifier][$imageType])) $returnData[$stormIdentifier][$imageType] = [];
				if(!isset($returnData[$stormIdentifier]['title'])) $returnData[$stormIdentifier]['title'] = (substr($stormIdentifier, 0, 2) == "AL" ? "Atlantic" : "Eastern Pacific") . " Cyclone #" . (int)substr($stormIdentifier, 2, 2) . ", " . $DateTime->format("Y");
				
				//Add product to array
				$returnData[$stormIdentifier][$imageType][]['description'] = "Rendered: $date " . $DateTime->format('T');
				$returnData[$stormIdentifier][$imageType][count($returnData[$stormIdentifier][$imageType]) - 1]['timestamp'] = $DateTime->getTimestamp();
			}
			
			//Eastern Pacific Cyclone Advisory
			if(stripos(basename($thisFile), "-HEPZ") !== false)
			{
				$hurricaneStatementLines = file($thisFile);
				for($i = 0; $i < count($hurricaneStatementLines); $i++)
				{
					$thisLine = trim($hurricaneStatementLines[$i]);
					
					//Find start of file
					if(stripos($thisLine, "BULLETIN") === 0)
					{
						$nameLine = trim($hurricaneStatementLines[++$i]);
						$identifierLine = trim($hurricaneStatementLines[++$i]);
						$advisoryTime = trim($hurricaneStatementLines[++$i]);
						
						//Get Storm Identifier
						$identifierParts = preg_split('/\s+/', $identifierLine);
						$stormIdentifier = substr($identifierParts[count($identifierParts) - 1], 0, 4) . "YY";
						if(!isset($returnData[$stormIdentifier])) $returnData[$stormIdentifier] = [];
						
						//Get Title and identifier
						$nameLineParts = preg_split('/ (Intermediate )?Advisory Number/', $nameLine);
						$thisAdvisoryNumber = trim($nameLineParts[1]);
						if(isset($returnData[$stormIdentifier]['latestAdvisory']) && strnatcmp($returnData[$stormIdentifier]['latestAdvisory'], $thisAdvisoryNumber) >= 0) break;
						
						$returnData[$stormIdentifier]['title'] = $nameLineParts[0];
						$returnData[$stormIdentifier]['latestAdvisory'] = $thisAdvisoryNumber;
						
						//Get Advisory Time
						$advisoryTimezone = preg_split('/\s+/', $advisoryTime)[2];
						$advisoryTimeParts = explode(" $advisoryTimezone ", $advisoryTime);
						$DateTime = new DateTime($advisoryTimeParts[1] . " " . substr_replace($advisoryTimeParts[0], ":", -5, 0) . " $advisoryTimezone", new DateTimeZone("$advisoryTimezone"));
						$DateTime->setTimezone(new DateTimeZone(date_default_timezone_get()));
						$returnData[$stormIdentifier]['latestAdvTime'] = $DateTime->format("F j, Y g:i A T");
					}
					
					//Current Location
					if(stripos($thisLine, "LOCATION...") === 0)
					{
						$locationParts = explode(" ", explode("...", $thisLine)[1]);
						$returnData[$stormIdentifier]['position'] = substr_replace($locationParts[0], "&deg ", -1, 0) . ", " . substr_replace($locationParts[1], "&deg ", -1, 0);
					}
					
					//Maximum Sustained Winds
					if(stripos($thisLine, "MAXIMUM SUSTAINED WINDS...") === 0)
					{
						$speedParts = explode("...", $thisLine);
						$speedMph = explode(" ", $speedParts[1])[0];
						$speedKph = explode(" ", $speedParts[2])[0];
						$speedKnots = round($speedMph * 0.868976);
						$returnData[$stormIdentifier]['maxWind'] = "$speedKnots Knots / $speedMph MPH / $speedKph KPH";
					}
					
					//Maximum Sustained Winds
					if(stripos($thisLine, "PRESENT MOVEMENT...") === 0)
					{
						$movementParts = explode("...", $thisLine);
						$speedMph = preg_replace("/[^0-9]/", "", explode(" AT ", $movementParts[1])[1]);
						$speedKph = preg_replace("/[^0-9]/", "", $movementParts[2]);
						$speedKnots = round($speedMph * 0.868976);
						$returnData[$stormIdentifier]['movement'] = explode(" OR", $movementParts[1])[0] . ", $speedKnots Knots / $speedMph MPH / $speedKph KPH";
					}
					
					//Maximum Sustained Winds
					if(stripos($thisLine, "MINIMUM CENTRAL PRESSURE...") === 0) $returnData[$stormIdentifier]['pressure'] = preg_replace("/[^0-9]/", "", explode("...", $thisLine)[1]) . " hPa";
				}
			}
			
			//Tropical Cyclone Advisory (Atlantic)
			if(stripos(basename($thisFile), "-TCA") !== false)
			{
				$hurricaneStatementLines = file($thisFile);
				for($i = 0; $i < count($hurricaneStatementLines); $i++)
				{
					$thisLine = trim($hurricaneStatementLines[$i]);
					
					//These first few lines, just pull the data to parse later
					if($i == 3)
					{
						//Exclude test data
						if(stripos($thisLine, "test") !== false) break;
						$fullName = $thisLine;
					}
					if($i == 5) $advisoryTime = $thisLine;
					
					//Get Storm Identifier
					if($i == 4)
					{
						$lineParts = preg_split('/\s+/', $thisLine);
						$stormIdentifier = substr($lineParts[count($lineParts) - 1], 0, 4) . "YY";
						if(!isset($returnData[$stormIdentifier])) $returnData[$stormIdentifier] = [];
					}
					
					//Get title based on this file
					if(stripos($thisLine, "TC:") === 0)
					{
						$dataValue = preg_split('/:\s+/', $thisLine)[1];
						$workingTitle = ucwords(strtolower(substr($fullName, 0, stripos($fullName, $dataValue) + strlen($dataValue))));
					}
					
					//Get advisory number, and only keep processing if it's the newest
					if(stripos($thisLine, "ADVISORY NR:") === 0)
					{
						$dataValue = preg_split('/:\s+/', $thisLine)[1];
						$thisAdvisoryNumber = ltrim(explode("/", $dataValue)[1], "0 ");
						if(isset($returnData[$stormIdentifier]['latestAdvisory']) && $returnData[$stormIdentifier]['latestAdvisory'] > $thisAdvisoryNumber) break;
						
						$returnData[$stormIdentifier]['latestAdvisory'] = $thisAdvisoryNumber;
						$returnData[$stormIdentifier]['title'] = $workingTitle;
						
						$advisoryTimeParts = explode(" UTC ", $advisoryTime);
						$DateTime = new DateTime($advisoryTimeParts[1] . " " . $advisoryTimeParts[0] . " UTC", new DateTimeZone("UTC"));
						$DateTime->setTimezone(new DateTimeZone(date_default_timezone_get()));
						$returnData[$stormIdentifier]['latestAdvTime'] = $DateTime->format("F j, Y g:i A T");
					}
					
					//Get observed position
					if(stripos($thisLine, "OBS PSN:") === 0)
					{
						$dataValue = preg_split('/:\s+/', $thisLine)[1];
						
						$returnData[$stormIdentifier]['position'] = substr($dataValue, 10, 2) . "." . substr($dataValue, 12, 2) . "&deg; " . substr($dataValue, 9, 1) . ", " . 
							ltrim(substr($dataValue, 16, 3), "0 ") . "." . substr($dataValue, 19, 2) . "&deg; " . substr($dataValue, 15, 1);
					}
					
					//Get Movement
					if(stripos($thisLine, "MOV:") === 0)
					{
						$dataValue = preg_split('/:\s+/', $thisLine)[1];
						$movementParts = explode(" ", $dataValue);
						$speedKnots = ltrim(preg_replace("/[^0-9]/", "", $movementParts[1]), "0 ");
						$speedMph = round($speedKnots * 1.15078);
						$speedKph = round($speedKnots * 1.852);
						$returnData[$stormIdentifier]['movement'] = $movementParts[0] . ", $speedKnots Knots / $speedMph MPH / $speedKph KPH";
					}
					
					//Current Status
					if(stripos($thisLine, "INTST CHANGE:") === 0)
					{
						$dataValue = preg_split('/:\s+/', $thisLine)[1];
						switch($dataValue)
						{
							case "WKN": $returnData[$stormIdentifier]['status'] = "Weakening"; break;
							case "INTSF": $returnData[$stormIdentifier]['status'] = "Intensifying"; break;
							default: $returnData[$stormIdentifier]['status'] = $dataValue; break;
						}
					}
					
					//Barometric Pressure
					if(stripos($thisLine, "C:") === 0) $returnData[$stormIdentifier]['pressure'] = ltrim(substr(preg_split('/:\s+/', $thisLine)[1], 0, 4), "0 ") . " hPa";
					
					//Max Wind
					if(stripos($thisLine, "MAX WIND:") === 0)
					{
						$dataValue = preg_split('/:\s+/', $thisLine)[1];
						$speedKnots = ltrim(preg_replace("/[^0-9]/", "", $dataValue), "0 ");
						$speedMph = round($speedKnots * 1.15078);
						$speedKph = round($speedKnots * 1.852);
						$returnData[$stormIdentifier]['maxWind'] = $movementParts[0] . ", $speedKnots Knots / $speedMph MPH / $speedKph KPH";
					}
					
					//Next Message
					if(stripos($thisLine, "NXT MSG:") === 0)
					{
						$dataValue = preg_split('/:\s+/', $thisLine)[1];
						if($dataValue == "NO MSG EXP") $returnData[$stormIdentifier]['nextMessage'] = "<i>No Message Expected</i>";
						else
						{
							$DateTime = new DateTime(str_replace("/", "T", $dataValue), new DateTimeZone("UTC"));
							$DateTime->setTimezone(new DateTimeZone(date_default_timezone_get()));
							$returnData[$stormIdentifier]['nextMessage'] = $DateTime->format("F j, Y g:i A T");
						}
					}
				}
			}
		}
		
		//Sort Images, add titles to them
		krsort($returnData);
		foreach($returnData as $stormKey => $stormValues)
		{
			foreach($stormValues as $dataKey => $dataValue)
			{
				if(is_array($dataValue))
				{
					usort($returnData[$stormKey][$dataKey], 'sortByTimestamp');
					for($i = 0; $i < count($returnData[$stormKey][$dataKey]); $i++) $returnData[$stormKey][$dataKey][$i]['subHtml'] = "<b>" . $returnData[$stormKey]['title'] . "</b><div class='goeslabel gl-overlay'>" . $returnData[$stormKey][$dataKey][$i]['description'] . "</div>";
				}
			}
		}
	}
	
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($returnData);
}
elseif($_GET['type'] == "weatherJSON")
{
	$returnData = [];
	$returnData['city'] = htmlspecialchars($currentSettings[$selectedProfile]['city'] == '' ? $currentSettings[$selectedProfile]['wxZone'] : $currentSettings[$selectedProfile]['city']);
	$returnData['state'] = htmlspecialchars($currentSettings[$selectedProfile]['stateAbbr']);
	
	//Get all EMWIN files for use later
	$allEmwinFiles = scandir_recursive($config['general']['emwinPath']);
	
	//Current Radar
	$returnData['localRadarMetadata'] = findMetadataEMWIN($allEmwinFiles, "RAD" . $currentSettings[$selectedProfile]['radarCode'] . ".GIF", "Local Composite Weather Radar");
	
	//Current Weather Conditions
	$rwrFile = findNewestEMWIN($allEmwinFiles, "RWR".$currentSettings[$selectedProfile]['rwrOrig']);
	if($rwrFile != "")
	{
		$data = file($rwrFile);
		$gotWeatherTime = false;
		foreach($data as $thisLine)
		{
			//The first line that starts with a number is the time of the report
			if(!$gotWeatherTime && is_numeric($thisLine[0]))
			{
				$returnData['weatherTime'] = trim($thisLine);
				$gotWeatherTime = true;
			}
			
			if(stripos($thisLine, $currentSettings[$selectedProfile]['city']) === 0)
			{
				$currentConditionParts = preg_split("/[ ]{2,}/", trim($thisLine), 3);
				$remainingConditionParts = array_pop($currentConditionParts);
				array_shift($currentConditionParts);
				$currentConditionParts = array_merge($currentConditionParts, preg_split("/[ ]+/", $remainingConditionParts));
				
				if($currentConditionParts[0]." ".$currentConditionParts[1] == "NOT AVBL")
				{
					$returnData['weatherDesc'] = "Not Available";
					break;
				}
				
				$returnData['weatherDesc'] = $currentConditionParts[0];
				$returnData['temp'] = $currentConditionParts[1];
				$returnData['dewPoint'] = $currentConditionParts[2];
				$returnData['humidity'] = $currentConditionParts[3];
				$returnData['pressure'] = $currentConditionParts[5];
				$returnData['remarks'] = (count($currentConditionParts) > 6 ? implode(" ", array_slice($currentConditionParts, 6)) : "");
				
				if($currentConditionParts[4] == "CALM")
				{
					$returnData['wind'] = 0;
					$returnData['windDirection'] = "";
				}
				else
				{
					$returnData['windDirection'] = "";
					for($i = strlen($currentConditionParts[4]) - 1; $i >= 0; $i--)
					{
						if(preg_match("/[0-9]+/", substr($currentConditionParts[4], 0, $i)) === 1) continue;
						$returnData['windDirection'] = substr($currentConditionParts[4], 0, $i);
						$noGust = explode("G", substr($currentConditionParts[4], $i));
						break;
					}
					
					$returnData['wind'] = $noGust[0];
					if(count($noGust) == 1) $returnData['windGust'] = "N/A";
					else $returnData['windGust'] = $noGust[1] . " MPH";
				}
				
				break;
			}
		}
	}
	
	//Regional Weather Summary, or current conditions in Area Forecast Discussion
	$dataPath = findNewestEMWIN($allEmwinFiles, "RWS".$currentSettings[$selectedProfile]['orig']);
	if($dataPath == "")
	{
		$dataPath = findNewestEMWIN($allEmwinFiles, "AFD".$currentSettings[$selectedProfile]['orig']);
		if($dataPath == "")
		{
			$returnData['summaryTime'] = "";
			$returnData['summary'] = "";
		}
		else
		{
			$data = file($dataPath);
			$dataBuffer = [];
			$decodingLine = -1;
			foreach($data as $rawLine)
			{
				$thisLine = trim($rawLine);
				if(stripos($thisLine, ".DISCUSSION...") === 0 || stripos($thisLine, ".NEAR TERM") === 0 || stripos($thisLine, ".SHORT TERM") === 0 || stripos($thisLine, ".UPDATE") === 0)
				{
					$decodingLine = 0;
					$dataBuffer[] = substr($thisLine, strrpos($thisLine, "...") + 3);
					continue;
				}
				if($decodingLine == -1) continue;
				if(strpos($thisLine, "&&") === 0 || stripos($thisLine, ".LONG TERM...") === 0) break;
				
				if($decodingLine > 0) $dataBuffer[] = $thisLine;
				else $dataBuffer[0] .= " ".$thisLine;
				$decodingLine++;
			}
			
			$returnData['summaryTime'] = trim($data[5]);
			$returnData['summary'] = linesToParagraphs($dataBuffer, 0);
		}
	}
	else
	{
		$data = file($dataPath);
		$startOfSummary = 0;
		while(stripos($data[$startOfSummary], "SUMMARY") === false) $startOfSummary++;
		
		$returnData['summaryTime'] = trim($data[$startOfSummary + 2]);
		$returnData['summary'] = linesToParagraphs($data, $startOfSummary + 4);
	}
	
	//7-day Forecast
	$forcastData = [];
	$decodingLine = -1;
	
	$sevenDayFile = findNewestEMWIN($allEmwinFiles, "PFM".$currentSettings[$selectedProfile]['orig']);
	if($sevenDayFile != "")
	{
		$data = file($sevenDayFile);
		foreach($data as $rawLine)
		{
			$thisLine = trim($rawLine);
			if(stripos($thisLine, $currentSettings[$selectedProfile]['wxZone']) === 0)
			{
				$decodingLine = 0;
				continue;
			}
			if($decodingLine == -1) continue;
			if(strpos($thisLine, "$$") === 0) break;
			
			$forcastData[] = $thisLine;
		}
	}
	
	//Check if data was found in this file. If not, switch to AFM
	if($decodingLine == -1)
	{
		$sevenDayFile = findNewestEMWIN($allEmwinFiles, "AFM".$currentSettings[$selectedProfile]['orig']);
		if($sevenDayFile != "")
		{
			$data = file($sevenDayFile);
			foreach($data as $rawLine)
			{
				$thisLine = trim($rawLine);
				if(stripos($thisLine, $currentSettings[$selectedProfile]['wxZone']) === 0)
				{
					$decodingLine = 0;
					continue;
				}
				if($decodingLine == -1) continue;
				if(strpos($thisLine, "$$") === 0) break;
				
				$forcastData[] = $thisLine;
			}
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
		if(stripos($thisLine, "PoP 12hr") === 0) $forecastPop = array_merge($forecastPop, parseFmLine($thisLine, $forecastLTBreaks));
		
		//Relative Humidity and Dewpoint (for calculating RH in days 4-7)
		if(stripos($thisLine, "RH") === 0) $forecastRh = parseFmLine($thisLine, $forecastLTBreaks);
		if(stripos($thisLine, "Dewpt") === 0 && count($forecastRh) > 0) $forecastDewpt = parseFmLine($thisLine, $forecastLTBreaks);
		
		//6-Hour Temps (Days 4-7 for calculating RH Only)
		if(stripos($thisLine, "Temp") === 0)
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
	$textForecastFile = findNewestEMWIN($allEmwinFiles, "ZFP".$currentSettings[$selectedProfile]['orig']);
	$returnData['alert'] = "";
	$returnData['forecast'] = [];
	if($textForecastFile != "")
	{
		$data = file($textForecastFile);
		$decodingLine = -1;
		$gettingAlert = false;
		foreach($data as $rawLine)
		{
			$thisLine = trim($rawLine);
			if(stripos($thisLine, $currentSettings[$selectedProfile]['wxZone']) === 0)
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
				elseif($thisLine != "" && isset($lastForecastName))
				{
					$returnData['forecast'][$lastForecastName] .= " ".$thisLine;
				}
			}
		}
	}
	
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($returnData);
}
else die();
?>
