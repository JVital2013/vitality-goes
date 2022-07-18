#!/bin/bash
source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"

today=$(date --date="today" +"%F")
oneWeekStartTime=$(date -u --date="$today - 7 days" +"%Y%m%d")
oneWeekEndTime=$(date -u --date="$today" +"%Y%m%d")

mkdir -p /tmp/abi

#Create 1 Week of Full Disk Videos
i=0
for currentSource in ${abiImgSource[@]}
do
	#Copy down files
	currentName=${abiVidName[i]}
	
	echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $currentName..."
	rm /tmp/abi/* > /dev/null 2>&1
	
	for dateStamp in `seq $oneWeekStartTime $oneWeekEndTime`
	do
		find "$currentSource" -type f -name "*_$dateStamp*.jpg" | xargs cp -t /tmp/abi/
	done
	
	#Trim off extra frames at the beginning and end
	for hour in {00..04}
	do
		rm /tmp/abi/*${oneWeekStartTime}T$hour*.jpg > /dev/null 2>&1
	done
	for hour in {05..23}
	do
		rm /tmp/abi/*${oneWeekEndTime}T$hour*.jpg > /dev/null 2>&1
	done
	
	#Shrink images if specified
	if [ ${abiResizeMode[$i]} = 0 ]; then
		mogrify -scale 1356 /tmp/abi/*.jpg
	elif [ ${abiResizeMode[$i]} = 1 ]; then
		mogrify -scale 1000 /tmp/abi/*.jpg
	elif [ ${abiResizeMode[$i]} = 2 ]; then
		mogrify -scale 1402x954 /tmp/abi/*.jpg
	fi
	
	#Generate MP4
	rm $videoDir/$currentName.mp4 > /dev/null 2>&1
	ffmpeg -hide_banner -loglevel error -framerate 15 -pattern_type glob -i '/tmp/abi/*.jpg' -c:v libx264 -crf 20 -pix_fmt yuv420p $videoDir/$currentName.mp4
	
	i=$((i+1))
done
