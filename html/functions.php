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
function loadConfig()
{
	//Load main config
	$config = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/config.ini", true, INI_SCANNER_RAW);
	$config['general']['showSysInfo'] = (stripos($config['general']['showSysInfo'], "true") !== false);
	$config['general']['debug'] = (stripos($config['general']['debug'], "true") !== false);
	
	//Load extra configs, allow them to not exist
	if(file_exists($_SERVER['DOCUMENT_ROOT'] . "/config/abi.ini"))
	{
		$config['abi'] = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/abi.ini", true, INI_SCANNER_RAW);
		parseABIConfig($config, $config['abi']);
	}
	else $config['abi'] = [];
	
	if(file_exists($_SERVER['DOCUMENT_ROOT'] . "/config/meso.ini"))
	{
		$config['meso'] = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/meso.ini", true, INI_SCANNER_RAW);
		parseABIConfig($config, $config['meso']);
	}
	else $config['meso'] = [];
	
	if(file_exists($_SERVER['DOCUMENT_ROOT'] . "/config/l2.ini"))
	{
		$config['l2'] = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/l2.ini", true, INI_SCANNER_RAW);
		parseABIConfig($config, $config['l2']);
	}
	else $config['l2'] = [];
	
	if(file_exists($_SERVER['DOCUMENT_ROOT'] . "/config/emwin.ini"))
	{
		$config['emwin'] = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/emwin.ini", true, INI_SCANNER_RAW);
	}
	else $config['emwin'] = [];
	
	//Config touchups
	if(array_key_exists('paths', $config)) unset($config['paths']);
	if(!array_key_exists('city', $config['location'])) $config['location']['city'] = "";
	if(!array_key_exists('rwrOrig', $config['location'])) $config['location']['rwrOrig'] = $config['location']['orig'];
	if(!array_key_exists('emwinPath', $config['general'])) $config['emwin'] = [];
	
	return $config;
}

function parseABIConfig($config, &$abiConfig)
{
	$slugs = array_keys($abiConfig);
	for($i = 0; $i < count($abiConfig); $i++)
	{
		if(!array_key_exists("filter", $abiConfig[$slugs[$i]])) $abiConfig[$slugs[$i]]['filter'] = "";
		if(array_key_exists('paths', $config)) foreach($config['paths'] as $key => $value)
			$abiConfig[$slugs[$i]]['path'] = str_replace('{' . $key . '}', $value, $abiConfig[$slugs[$i]]['path']);
	}
}

function scandir_recursive($dir, &$results = array())
{
	$dirHandle = opendir($dir);
	while(($currentFile = readdir($dirHandle)) !== false)
	{
		if($currentFile == '.' or $currentFile == '..') continue;
		$path = $dir . DIRECTORY_SEPARATOR . $currentFile;
		if(is_dir($path)) scandir_recursive($path, $results);
		else $results[] = $path;
	}
	closedir($dirHandle);
	
    return $results;
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
	return $explodedB[4] - $explodedA[4];
}

function sortABI($a, $b)
{
	return strcmp(basename($a), basename($b));
}

function findNewestEMWIN($allEmwinFiles, $product)
{
	$highestImage = 0;
	$path = "";
	
	foreach($allEmwinFiles as $thisFile)
	{
		if(strpos($thisFile, $product) !== false)
		{
			$fileNameParts = explode("_", basename($thisFile));
			if(count($fileNameParts) != 6) continue;
			
			if($fileNameParts[4] > $highestImage)
			{
				$path = $thisFile;
				$highestImage = $fileNameParts[4];
			}
		}
	}
	
	return $path;
}

function findSpecificEMWIN($allEmwinFiles, $product, $timestamp)
{
	$DateTime = new DateTime("now", new DateTimeZone(date_default_timezone_get()));
	$DateTime->setTimestamp($timestamp);
	$DateTime->setTimezone(new DateTimeZone("UTC"));
	
	foreach($allEmwinFiles as $thisFile)
	{
		if(strpos($thisFile, $DateTime->format('YmdHis')) !== false && strpos($thisFile, $product) !== false)
		{
			return $thisFile;
		}
	}
	
	return false;
}

function findMetadataEMWIN($allEmwinFiles, $product, $title)
{
	$retVal = [];
	
	foreach($allEmwinFiles as $thisFile)
	{
		if(strpos($thisFile, $product) !== false)
		{
			$fileNameParts = explode("_", basename($thisFile));
			if(count($fileNameParts) != 6) continue;
			
			$DateTime = new DateTime($fileNameParts[4], new DateTimeZone("UTC"));
			$DateTime->setTimezone(new DateTimeZone(date_default_timezone_get()));
			$date = $DateTime->format("F j, Y g:i A");
			$retVal[]['subHtml'] = "<b>$title</b><div class='goeslabel gl-overlay'>Rendered: $date " . $DateTime->format('T') . "</div>";
			$retVal[count($retVal) - 1]['description'] = "Rendered: $date " . $DateTime->format('T');
			$retVal[count($retVal) - 1]['timestamp'] = $DateTime->getTimestamp();
		}
	}	
	usort($retVal, 'sortByTimestamp');
	return $retVal;
}

function findMetadataABI($path, $filter, $title)
{
	if(!is_dir($path)) return array();
	
	$retVal = [];
	$fileList = scandir_recursive($path);
	$fileList = preg_grep("/(\\\\|\/)[^\\\\\/]*{$filter}[^\\\\\/]*[0-9]{8}T[0-9]{6}Z\..{3}$/", $fileList);
	usort($fileList, "sortABI");
	
	foreach($fileList as $file)
	{
		
		$splitName = explode("_", $file);
		$timestamp = strtotime(explode(".", $splitName[count($splitName) - 1])[0]);
		$date = date("F j, Y g:i A", $timestamp);
		$DateTime = new DateTime("now", new DateTimeZone(date_default_timezone_get()));
		$retVal[]['subHtml'] = "<b>$title</b><div class='goeslabel gl-overlay'>$date " . $DateTime->format('T') . "</div>";
		$retVal[count($retVal) - 1]['description'] = "Taken: $date " . $DateTime->format('T');
		$retVal[count($retVal) - 1]['timestamp'] = $timestamp;
	}
	
	return $retVal;
}

function findImageABI($path, $filter, $timestamp)
{
	$DateTime = new DateTime("now", new DateTimeZone("UTC"));
	$DateTime->setTimestamp($timestamp);
	
	$fileList = scandir_recursive($path);
	foreach($fileList as $thisFile) if(preg_match("/(\\\\|\/)[^\\\\\/]*{$filter}[^\\\\\/]*" . $DateTime->format('Ymd\THis\Z') . "\..{3}$/", $thisFile)) return $thisFile;
}

function linesToParagraphs($lineArray, $linesToSkip)
{
	$startingParagraph = false;
	$retVal = (count($lineArray) > 0 ? "<p style='font-weight: bold;'>" : "");
	foreach($lineArray as $key => $line)
	{
		if($key < $linesToSkip) continue;
		$thisLine = trim($line);
		
		if($thisLine == "$$")
		{
			$retVal .= "</p>";
			break;
		}
		if(empty($thisLine))
		{
			$retVal .= "</p>";
			$startingParagraph = true;
			continue;
		}
		
		if($startingParagraph)
		{
			$retVal .= "<p>";
			$startingParagraph = false;
		}
		
		$retVal .= "$thisLine ";
		if(strlen($thisLine) < 55) $retVal .= "<br />";
	}
	
	return $retVal;
}

function is_in_polygon($points_polygon, $vertices_x, $vertices_y, $longitude_x, $latitude_y)
{
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
	set_error_handler("convertToException");
	try
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
	catch(exception $e)
	{
		$metadata = [];
	}
	restore_error_handler();
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
