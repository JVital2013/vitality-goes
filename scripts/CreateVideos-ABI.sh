#!/bin/bash
if ! command -v mogrify &> /dev/null
then
    echo -e "mogrify could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install imagemagick"
    exit
fi
if ! command -v ffmpeg &> /dev/null
then
    echo -e "ffmpeg could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install ffmpeg"
    exit
fi

source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"

#Verify Config is valid
if [[ ${#abiImgSource[@]} -ne ${#abiVidName[@]} || ${#abiImgSource[@]} -ne ${#abiResizeMode[@]} ]]
then
	echo "abiImgSource, abiVidName, and abiResizeMode must have the same number of elements in scriptconfig.ini"
	exit
fi

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
		fileList=$(find "$currentSource" -type f -name "*_$dateStamp*.jpg" | grep -v $oneWeekStartTime"T0[0-4]" | grep -E -v $oneWeekEndTime"T(0[5-9]|1[0-9]|2[0-3])")
		if [ ${abiResizeMode[$i]} = 0 ]; then
			echo $fileList | xargs mogrify -scale 1356 -path /tmp/abi
		elif [ ${abiResizeMode[$i]} = 1 ]; then
			echo $fileList | xargs mogrify -scale 1000 -path /tmp/abi
		elif [ ${abiResizeMode[$i]} = 2 ]; then
			echo $fileList | xargs mogrify -scale 1402x954 -path /tmp/abi
		else
			echo $fileList | xargs cp -t /tmp/abi/
		fi
	done
	
	#Generate MP4
	rm $videoDir/$currentName.mp4 > /dev/null 2>&1
	ffmpeg -hide_banner -loglevel error -framerate 15 -pattern_type glob -i '/tmp/abi/*.jpg' -c:v libx264 -crf 20 -pix_fmt yuv420p $videoDir/$currentName.mp4
	
	i=$((i+1))
done
