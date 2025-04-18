#!/bin/bash
source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"
twoWeeksAgoABI=$(date -u --date="-14 days" +"%Y-%m-%d_%H-%M-%S")
twoWeeksAgoEMWIN=$(date -u --date="-14 days" +"%Y%m%d%H%M%S")

#NWS
for file in $(find $abiSrcDir/IMAGES/NWS -name "*" -type f)
do
	datestr=$(echo $file | awk -F/ '{print $NF}' | cut -d '-' -f 1)
	if [[ $datestr < $twoWeeksAgoEMWIN ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Deleting $file..."
		rm $file
	fi
done

#EMWIN
for file in $(find $emwinSrcDir -name "*" -type f)
do
	if [[ $file =~ .*\.zip ]]
	then
		continue
	fi
	
	datestr=$(echo $file | awk -F/ '{print $NF}' | cut -d _ -f 5)
	if [[ $datestr < $twoWeeksAgoEMWIN ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Deleting $file..."
		rm $file
	fi
done

#ABI Imagery
imageFiles=()
mapfile -d $'\0' imageFiles < <(find $abiSrcDir/IMAGES/GOES-19 $abiSrcDir/IMAGES/GOES-18 $abiSrcDir/IMAGES/Himawari $abiSrcDir/L2 -name "*-*-*_*-*-*" -type d -print0 2>/dev/null)
for file in "${imageFiles[@]}"
do
	datestr=$(basename "$file")
	if [[ $datestr < $twoWeeksAgoABI ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Deleting $file..."
		rm -rf "$file"
	fi
done