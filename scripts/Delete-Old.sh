#!/bin/bash
source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"
twoWeeksAgoABI=$(date -u --date="-10 days" +"%Y%m%dT%H%M%SZ")
twoWeeksAgoEMWIN=$(date -u --date="-10 days" +"%Y%m%d%H%M%S")

#NWS, Text
for file in $(find $abiSrcDir/nws $abiSrcDir/text -name "*" -type f)
do
	datestr=$(echo $file | awk -F/ '{print $NF}' | cut -d _ -f 1)
	if [[ $datestr < $twoWeeksAgoABI ]]
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
for file in $(find $abiSrcDir/goes16 $abiSrcDir/goes17 $abiSrcDir/composite -name "*" -type f)
do
	datestr=$(echo $file | awk -F/ '{print $NF}' | awk -F_ '{print $NF}' | cut -d . -f 1)
	if [[ $datestr < $twoWeeksAgoABI ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Deleting $file..."
		rm $file
	fi
done
