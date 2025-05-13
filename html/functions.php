<?php
/* 
 * Copyright 2022-2025 Jamie Vital
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
 
function getProgramDir()
{
	return dirname(__FILE__);
}
function loadConfig()
{
	//Load main config
	if(!file_exists(getProgramDir() . "/config/config.ini")) die("config.ini is missing! Make sure\nyou have config files in:\n\n" . getProgramDir() . "/config/");
	$config = parse_ini_file(getProgramDir() . "/config/config.ini", true, INI_SCANNER_RAW);
	if($config === false) die("Unable to parse config.ini");
	if(!array_key_exists('general', $config)) die("Invalid config.ini - general section is missing");
	
	//Boolean Values
	$config['general']['fastEmwin'] = (array_key_exists('fastEmwin', $config['general']) &&
		stripos($config['general']['fastEmwin'], "true") !== false);
	$config['general']['showSysInfo'] = (array_key_exists('showSysInfo', $config['general']) &&
		stripos($config['general']['showSysInfo'], "true") !== false);
	$config['general']['debug'] = (array_key_exists('debug', $config['general']) &&
		stripos($config['general']['debug'], "true") !== false);
	$config['general']['spaceWeatherAlerts'] = (array_key_exists('spaceWeatherAlerts', $config['general']) &&
		stripos($config['general']['spaceWeatherAlerts'], "true") !== false);
	
	//Other EMWIN config
	if(!array_key_exists('otheremwin', $config)) $config['otheremwin'] = [];
	if(!array_key_exists('ini', $config['otheremwin'])) $config['otheremwin']['ini'] = "otheremwin.ini";
	if(!array_key_exists('maxUserFiles', $config['otheremwin'])) $config['otheremwin']['maxUserFiles'] = "1000";
	if(!array_key_exists('allowUserLoader', $config['otheremwin'])) $config['otheremwin']['allowUserLoader'] = "true";
	
	$config['otheremwin']['ini'] = $config['otheremwin']['ini'] = getProgramDir() . '/config/' . $config['otheremwin']['ini'];
	$config['otheremwin']['allowUserLoader'] = (stripos($config['otheremwin']['allowUserLoader'], "true") !== false);
	$config['otheremwin']['maxUserFiles'] = intval($config['otheremwin']['maxUserFiles']);
	
	//Load Extra configs
	if(!array_key_exists('categories', $config)) $config['categories'] = [];
	else
	{
		foreach($config['categories'] as $type => $inifile)
		{
			//Validate Extra Configs
			unset($config['categories'][$type]);
			if(!file_exists(getProgramDir() . "/config/$inifile")) continue;
			
			$configPart = parse_ini_file(getProgramDir() . "/config/$inifile", true, INI_SCANNER_RAW);
			if($configPart === false ||
				!array_key_exists('_category_', $configPart) || 
				count($configPart) < 2 || 
				!array_key_exists('title', $configPart['_category_']) ||
				!array_key_exists('icon', $configPart['_category_']))
				continue;
			
			//Get Category Information
			$config['categories'][$type] = [];
			$config['categories'][$type]['title'] = $configPart['_category_']['title'];
			$config['categories'][$type]['icon'] = $configPart['_category_']['icon'];
			unset($configPart['_category_']);
			
			//Parse config for each card
			$slugs = array_keys($configPart);
			for($i = 0; $i < count($configPart); $i++)
			{
				if(!array_key_exists("filter", $configPart[$slugs[$i]])) $configPart[$slugs[$i]]['filter'] = "";
				if(!array_key_exists("mode", $configPart[$slugs[$i]])) $configPart[$slugs[$i]]['mode'] = "endz";
				if(array_key_exists('paths', $config)) foreach($config['paths'] as $key => $value)
					$configPart[$slugs[$i]]['path'] = str_replace('{' . $key . '}', $value, $configPart[$slugs[$i]]['path']);
				
				$configPart[$slugs[$i]]['fast'] =
					(array_key_exists('fast', $configPart[$slugs[$i]]) ? stripos($configPart[$slugs[$i]]['fast'], "true") !== false : false);
			}
			
			$config['categories'][$type]['data'] = $configPart;
		}
	}
	
	//Other config touchups
	if(array_key_exists('paths', $config)) unset($config['paths']);
	if(!array_key_exists('city', $config['location'])) $config['location']['city'] = "";
	if(!array_key_exists('rwrOrig', $config['location']) && array_key_exists('orig', $config['location'])) $config['location']['rwrOrig'] = $config['location']['orig'];

	return $config;
}

function loadOtherEmwin($config)
{
	//Load Other Emwin Config
	$otheremwin = [];
	$otheremwin['user'] = [];
	$otheremwin['system'] = false;
	
	if(file_exists($config['otheremwin']['ini'])) $otheremwin['system'] = parse_ini_file($config['otheremwin']['ini'], true, INI_SCANNER_RAW);
	if($otheremwin['system'] === false) $otheremwin['system'] = [];
	else $otheremwin['system'] = array_values($otheremwin['system']);
	
	//Verify Other Emwin Config
	for($i = 0; $i < count($otheremwin['system']); $i++)
	{
		if(!in_array($otheremwin['system'][$i]['format'], array('paragraph', 'formatted'))) $otheremwin['system'][$i]['format'] = 'formatted';
		if(!is_numeric($otheremwin['system'][$i]['truncate'])) $otheremwin['system'][$i]['truncate'] = 0;
	}
	
	//Load Other Emwin info from cookie
	$sendCookie = false;
	if(array_key_exists('otheremwin', $_COOKIE) && $config['otheremwin']['allowUserLoader'])
	{
		$allCards = explode("~", $_COOKIE['otheremwin']);
		foreach($allCards as $thisCard)
		{
			$cardParts = explode("!", $thisCard);
			
			//Verify data
			if(count($cardParts) != 4 || !is_numeric($cardParts[2]) || !is_numeric($cardParts[3]))
			{
				$sendCookie = true;
				continue;
			}
			
			$formatInt = intval($cardParts[2]);
			$truncateInt = intval($cardParts[3]);
			$identifier = base64_decode(str_replace("-", "=", $cardParts[0]));
			if(!in_array($formatInt, array(0, 1)) || $truncateInt < 0 || $truncateInt > 10 || $identifier === false || !ctype_print($identifier))
			{
				$sendCookie = true;
				continue;
			}
			
			//Keep cookie if there were tags in the title; just strip them
			$titleNoTags = strip_tags($cardParts[1]);
			if($cardParts[1] != $titleNoTags) $sendCookie = true;
			
			//Pass data along from cookie if OK
			$otheremwin['user'][] = [
				'identifier' => $identifier,
				'title' => $titleNoTags,
				'format' => ($formatInt == 0 ? "formatted" : "paragraph"),
				'truncate' => $truncateInt
			];
		}
	}

	//Save other emwin settings in case something changed
	if($sendCookie)
	{
		$profileParts = [];
		foreach($otheremwin['user'] as $thisCard)
		{
			$profileParts[] = join("!", [
				str_replace("=", "-", base64_encode($thisCard['identifier'])),
				rawurlencode($thisCard['title']),
				($thisCard['format'] == "formatted" ? 0 : 1),
				$thisCard['truncate']
			]);
		}
		
		$cookiePrefix = (ip2long($_SERVER['SERVER_NAME']) === false ? "." : "");
		setrawcookie("otheremwin", join("~", $profileParts), time() + 31536000, "/", $cookiePrefix.$_SERVER['SERVER_NAME']);
	}
	
	return $otheremwin;
}

function findAllThemes()
{
	$themes = [];
	if(!is_dir(getProgramDir() . "/themes")) return $themes;
	
	$themeDirs = glob(getProgramDir() . "/themes/*", GLOB_ONLYDIR);
	foreach($themeDirs as $themeDir)
	{
		//Make sure theme is valid
		if(!is_file("$themeDir/theme.ini")) continue;
		$thisThemeDef = parse_ini_file("$themeDir/theme.ini", true, INI_SCANNER_RAW);
		if($thisThemeDef === false || !array_key_exists("stylesheets", $thisThemeDef) || !is_array($thisThemeDef['stylesheets'])) continue;
		
		//Make sure the theme doesn't try loading something strange
		foreach($thisThemeDef['stylesheets'] as $stylesheet)
			if((!preg_match("/^https?:\/\/.*$/", $stylesheet) && strpos($stylesheet, "..") !== false) ||
				(!preg_match("/^https?:\/\/.*$/", $stylesheet) && !is_file("$themeDir/$stylesheet")))
					continue 2;
		
		//Theme is valid, allow it
		$themes[basename($themeDir)] = $thisThemeDef;
	}
	
	return $themes;
}

function loadTheme($config)
{
	$themes = findAllThemes();
	
	//If default theme is defined in cookie, return false (no theme)
	//Otherwise, use the overlay theme specified if it exists
	if(array_key_exists('selectedTheme', $_COOKIE))
	{
		if($_COOKIE['selectedTheme'] == "default") return false;
		if(array_key_exists($_COOKIE['selectedTheme'], $themes)) $themeToUse = $_COOKIE['selectedTheme'];
	}
	
	//If no valid theme was found in the cookie, check for a valid theme
	//in the server config. Use it if found
	if(!isset($themeToUse) && array_key_exists('siteTheme', $config['general']) && array_key_exists($config['general']['siteTheme'], $themes))
		$themeToUse = $config['general']['siteTheme'];
	
	//Return theme if found; otherwise return false
	if(isset($themeToUse))
	{
		$themes[$themeToUse]['slug'] = $themeToUse;
		return $themes[$themeToUse];
	}
	else return false;
}

function scandir_recursive($dir, $fast)
{
	if($fast) $iterator = new FilesystemIterator($dir, FilesystemIterator::SKIP_DOTS | FilesystemIterator::CURRENT_AS_PATHNAME);
	else
	{
		$directoryIterator = new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS | FilesystemIterator::CURRENT_AS_PATHNAME);
		$iterator = new RecursiveIteratorIterator($directoryIterator);
	}
	
	$retVal = [];
	foreach($iterator as $result) $retVal[] = $result;
	return $retVal;
}

function sortByTimestamp($a, $b)
{
	return $a['timestamp'] - $b['timestamp'];
}

function sortOrig($a, $b)
{
	$subReturn = strcmp($a['state'], $b['state']);
	if($subReturn === 0) return strcmp($a['orig'], $b['orig']);
	else return $subReturn;
}

function sortByCity($a, $b)
{
	return strcmp($a['city'], $b['city']);
}

function sortEMWIN($a, $b)
{
	$explodedA = explode("_", basename($a));
	$explodedB = explode("_", basename($b));
	
	if(count($explodedA) != 6 || count($explodedB) != 6) return 0;
	return $explodedA[4] - $explodedB[4];
}

function sortByBasename($a, $b)
{
	return strcmp(basename($a), basename($b));
}

function findNewestEMWIN($allEmwinFiles, $product)
{
	$highestImage = 0;
	$path = "";
	
	$productEmwinFiles = preg_grep("/$product/", $allEmwinFiles);
	foreach($productEmwinFiles as $thisFile)
	{
		$fileNameParts = explode("_", basename($thisFile));
		if(count($fileNameParts) != 6) continue;
		
		if($fileNameParts[4] > $highestImage)
		{
			$path = $thisFile;
			$highestImage = $fileNameParts[4];
		}
	}
	
	return $path;
}

function getEMWINDate($path)
{
	//This assumes the path is already validated as EMWIN!
	$fileNameParts = explode("_", basename($path));
	$DateTime = new DateTime($fileNameParts[4], new DateTimeZone("UTC"));
	$DateTime->setTimezone(new DateTimeZone(date_default_timezone_get()));
	return $DateTime->format("M d, Y Hi T");
}

function findSpecificEMWIN($allEmwinFiles, $product, $timestamp)
{
	$DateTime = new DateTime("now", new DateTimeZone(date_default_timezone_get()));
	$DateTime->setTimestamp($timestamp);
	$DateTime->setTimezone(new DateTimeZone("UTC"));
	$specificEmwinFiles = array_values(preg_grep("/_" . $DateTime->format('YmdHis') . "_[^\\\\\/]*{$product}[^\\\\\/]*\..{3}$/", $allEmwinFiles));

	if($specificEmwinFiles !== false && count($specificEmwinFiles) > 0) return $specificEmwinFiles[0];
	return false;
}

function findMetadataEMWIN($allEmwinFiles, $product)
{
	$retVal = [];
	$productEmwinFiles = preg_grep("/$product/", $allEmwinFiles);
	foreach($productEmwinFiles as $thisFile)
	{
		$fileNameParts = explode("_", basename($thisFile));
		if(count($fileNameParts) != 6) continue;
		
		$DateTime = new DateTime($fileNameParts[4], new DateTimeZone("UTC"));
		$DateTime->setTimezone(new DateTimeZone(date_default_timezone_get()));
		$retVal[]['description'] = "Rendered: ". $DateTime->format("F j, Y g:i A T");
		$retVal[count($retVal) - 1]['timestamp'] = $DateTime->getTimestamp();
	}	
	usort($retVal, 'sortByTimestamp');
	return $retVal;
}

function getFormatByMode($mode, $filter)
{
	switch($mode)
	{
		case "satdump_geo":
			$regex = "/(\\\\|\/)(?<date>[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2})(\\\\|\/)[^\\\\\/]*{$filter}\..{3}$/i";
			$dateFormat = "Y-m-d_H-i-s";
			break;
		case "begin":
			$regex = "/(\\\\|\/)(?<date>[0-9]{14})[^\\\\\/]*{$filter}[^\\\\\/]*\..{3}$/i";
			$dateFormat = "YmdHis";
			break;
		case "beginu":
			$regex = "/(\\\\|\/)(?<date>[0-9]{8}_[0-9]{6})[^\\\\\/]*{$filter}[^\\\\\/]*\..{3}$/i";
			$dateFormat = "Ymd_His";
			break;
		case "beginz":
			$regex = "/(\\\\|\/)(?<date>[0-9]{8}T[0-9]{6}Z)[^\\\\\/]*{$filter}[^\\\\\/]*\..{3}$/i";
			$dateFormat = "Ymd\THis\Z";
			break;
		case "xrit":
			$regex = "/{$filter}[^\\\\\/]*(?<date>[0-9]{12})\..{3}$/i";
			$dateFormat = "YmdHi";
			break;
		case "emwin":
			$regex = "/_(?<date>[0-9]{14})_[^\\\\\/]*{$filter}[^\\\\\/]*\..{3}$/i";
			$dateFormat = "YmdHis";
			break;
		case "end":
			$regex = "/{$filter}[^\\\\\/]*(?<date>[0-9]{14})\..{3}$/i";
			$dateFormat = "YmdHis";
			break;
		case "endu":
			$regex = "/{$filter}[^\\\\\/]*(?<date>[0-9]{8}_[0-9]{6})\..{3}$/i";
			$dateFormat = "Ymd_His";
			break;
		case "endz":
			$regex = "/{$filter}[^\\\\\/]*(?<date>[0-9]{8}T[0-9]{6}Z)\..{3}$/i";
			$dateFormat = "Ymd\THis\Z";
			break;
		default: die("Invalid server config: $mode is not a valid file parser mode!"); break;
	}
	return array("regex" => $regex, "dateFormat" => $dateFormat);
}

function linesToParagraphs($lineArray, $linesToSkip)
{
	$startingParagraph = $startingSection = false;
	$firstParagraph = true;
	$firstParagraphText = "";
	$retVal = [];
	$section = 0;
	if(count($lineArray) > 0) $retVal[] = "<p style='font-weight: bold;'>";
	for($i = $linesToSkip; $i < count($lineArray); $i++)
	{
		$thisLine = trim($lineArray[$i]);
		
		if($thisLine == "$$")
		{
			if(!$startingParagraph) $retVal[$section] .= "</p>";
			$startingParagraph = false;
			$startingSection = true;
			continue;
		}
		if(empty($thisLine))
		{
			if(!$startingParagraph && !$startingSection)
			{
				$retVal[$section] .= "</p>";
				if($firstParagraph)
				{
					$firstParagraphText = $retVal[$section];
					$firstParagraph = false;
				}
				$startingParagraph = true;
			}
			continue;
		}
		
		if($startingSection && $i != count($lineArray) - 1)
		{
			$retVal[] = "<p>";
			$section++;
			$startingSection = false;
		}
		
		if($startingParagraph && $i != count($lineArray) - 1)
		{
			$retVal[$section] .= "<p>";
			$startingParagraph = false;
		}
		
		$retVal[$section] .= "$thisLine ";
		if(strlen($thisLine) < 55) $retVal[$section] .= "<br />";
	}
	
	//Clean up hanging tags
	if(!$startingParagraph && !$startingSection) $retVal[$section] .= "</p>";
	for($i = 1; $i < count($retVal); $i++) $retVal[$i] = $firstParagraphText . $retVal[$i];
	
	$retVal = array_values($retVal);
	return $retVal;
}

function is_in_polygon($points_polygon, $vertices_x, $vertices_y, $longitude_x, $latitude_y)
{
	if($vertices_x[0] != $vertices_x[count($vertices_x) - 1] || $vertices_y[0] != $vertices_y[count($vertices_y) - 1])
	{
		$vertices_x[] = $vertices_x[0];
		$vertices_y[] = $vertices_y[0];
		$points_polygon++;
	}

	$i = $j = $c = 0;
	for ($i = 0, $j = $points_polygon ; $i < $points_polygon; $j = $i++)
	{
		if ((($vertices_y[$i]  >  $latitude_y != ($vertices_y[$j] > $latitude_y)) &&
		($longitude_x < ($vertices_x[$j] - $vertices_x[$i]) * ($latitude_y - $vertices_y[$i]) / ($vertices_y[$j] - $vertices_y[$i]) + $vertices_x[$i]))) $c = !$c;
	}
	return $c;
}

function parseFmLine($line, $forecastLTBreaks)
{
	$retVal = [];
	
	foreach($forecastLTBreaks as $thisBreak) $line = substr_replace($line, "", $thisBreak, 2);
	for($i = 13; $i < strlen($line); $i += 3)
	{
		$retVal[] = trim(substr($line, $i, 3));
	}
	
	return $retVal;
}

function parseGraphiteData(&$metadata, $tz, $graphiteAPI, $target, $title, $color)
{
	$tzUrl = urlencode($tz);
	$targetUrl = urlencode($target);
	$titleUrl = urlencode($title);

	$hrArray = json_decode(file_get_contents("$graphiteAPI?format=json&from=-1hours&tz=$tzUrl&target=$targetUrl"))[0]->datapoints;
	$dayArray = json_decode(file_get_contents("$graphiteAPI?format=json&from=-1days&tz=$tzUrl&target=$targetUrl"))[0]->datapoints;
	$hrSum = $daySum = 0;

	foreach($hrArray as $thisPacket) {$hrSum += $thisPacket[0];}
	foreach($dayArray as $thisPacket) {$daySum += $thisPacket[0];}

	$metadata['description'] = "1 Hour Average: " . round($hrSum / count($hrArray), 2) . " | 1 Day Average: " . round($daySum / count($dayArray), 2);
	$metadata['svg1hr'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents("$graphiteAPI?width=600&height=350&format=svg&title=$titleUrl%20(1%20Hour)&fontSize=14&lineWidth=2&from=-1hours&hideLegend=true&colorList=$color&tz=$tzUrl&target=$targetUrl"));
	$metadata['svg1day'] = preg_replace("(clip-path.*clip-rule.*\")", "", file_get_contents("$graphiteAPI?width=600&height=350&format=svg&title=$titleUrl%20(1%20Day)&fontSize=14&lineWidth=2&from=-24hours&hideLegend=true&colorList=$color&tz=$tzUrl&target=$targetUrl"));
}

function convertToException($err_severity, $err_msg, $err_file, $err_line)
{
	throw new ErrorException($err_msg, 0, $err_severity, $err_file, $err_line);
	return true;
}

function verifyCommand($command)
{
	$test = PHP_OS_FAMILY == "Windows" ? 'where' : 'command -v';
	return is_executable(trim(shell_exec("$test $command")));
}
?>
