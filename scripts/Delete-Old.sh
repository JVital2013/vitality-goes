#!/bin/bash
srcDir="/path/to/goestoolsrepo"

twoWeeksAgoABI=$(date -u --date="-10 days" +"%Y%m%dT%H%M%SZ")
twoWeeksAgoEMWIN=$(date -u --date="-10 days" +"%Y%m%d%H%M%S")

#NWS, Text
for file in $(find "$srcDir/nws" "$srcDir/text" -name "*" -type f)
do
	datestr=$(echo $file | cut -d / -f 7 | cut -d _ -f 1)
	
	if [[ $datestr < $twoWeeksAgoABI ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Deleting $file..."
		rm $file
	fi
done

#EMWIN
for file in "$srcDir/emwin/*"
do
	datestr=$(echo $file | cut -d _ -f 5)
	
	if [[ $file =~ .*\.zip ]]
	then
		continue
	fi
	
	if [[ $datestr < $twoWeeksAgoEMWIN ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Deleting $file..."
		rm $file
	fi
done

#ABI Imagery
for file in $(find "$srcDir/goes16" "$srcDir/goes17" -name "*" -type f)
do
	if [[ $file =~ .*enhanced.* ]]
	then
		datestr=$(echo $file | cut -d _ -f 6 | cut -d . -f 1)
	else
		datestr=$(echo $file | cut -d _ -f 4 | cut -d . -f 1)
	fi
	
	if [[ $datestr < $twoWeeksAgoABI ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Deleting $file..."
		rm $file
	fi
done
