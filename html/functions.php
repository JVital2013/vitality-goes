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
	$config = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/config.ini", true, INI_SCANNER_RAW);
	$config['general']['showSysInfo'] = (stripos($config['general']['showSysInfo'], "true") !== false);
	$config['general']['debug'] = (stripos($config['general']['debug'], "true") !== false);
	$config['abi'] = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/abi.ini", true, INI_SCANNER_RAW);
	$config['meso'] = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/meso.ini", true, INI_SCANNER_RAW);
	$config['l2'] = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/l2.ini", true, INI_SCANNER_RAW);
	$config['emwin'] = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . "/config/emwin.ini", true, INI_SCANNER_RAW);
	$abiSlugs = array_keys($config['abi']);
	$mesoSlugs = array_keys($config['meso']);
	$l2Slugs = array_keys($config['l2']);
	$emwinSlugs = array_keys($config['emwin']);
	
	if(array_key_exists('paths', $config))
	{
		foreach($config['paths'] as $key => $value)
		{
			for($i = 0; $i < count($config['abi']); $i++) $config['abi'][$abiSlugs[$i]]['path'] = str_replace('{' . $key . '}', $value, $config['abi'][$abiSlugs[$i]]['path']);
			for($i = 0; $i < count($config['meso']); $i++) $config['meso'][$mesoSlugs[$i]]['path'] = str_replace('{' . $key . '}', $value, $config['meso'][$mesoSlugs[$i]]['path']);
			for($i = 0; $i < count($config['l2']); $i++) $config['l2'][$l2Slugs[$i]]['path'] = str_replace('{' . $key . '}', $value, $config['l2'][$l2Slugs[$i]]['path']);
		}
		unset($config['paths']);
	}
	
	if(!array_key_exists('city', $config['location'])) $config['location']['city'] = "";
	if(!array_key_exists('rwrOrig', $config['location'])) $config['location']['rwrOrig'] = $config['location']['orig'];
	if(!array_key_exists('emwinPath', $config['general'])) $config['emwin'] = [];
	
	return $config;
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
	return explode("_", basename($b))[4] - explode("_", basename($a))[4];
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
			$fileNameParts = explode("_", $thisFile);
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

function findMetadataABI($path, $title)
{
	if(!is_dir($path)) return array();
	
	$retVal = [];
	$fileList = scandir_recursive($path);
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

function findImageABI($path, $timestamp)
{
	$DateTime = new DateTime("now", new DateTimeZone("UTC"));
	$DateTime->setTimestamp($timestamp);
	
	$fileList = scandir_recursive($path);
	foreach($fileList as $thisFile) if(strpos($thisFile, $DateTime->format('Ymd\THis\Z'))) return $thisFile;
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
?>
