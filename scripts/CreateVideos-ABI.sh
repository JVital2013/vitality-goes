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
if [[ ${#abiImgSource[@]} -ne ${#abiVidName[@]} ]]
then
	echo "abiImgSource and abiVidName must have the same number of elements in scriptconfig.ini"
	exit
fi

today=$(date --date="today" +"%F")
oneWeekStartTime=$(date -u --date="$today - 7 days" +"%Y%m%d")
oneWeekEndTime=$(date -u --date="$today" +"%Y%m%d")

mkdir -p /tmp/abi

#Create 1 Week of ABI Videos
i=0
for currentSource in ${abiImgSource[@]}
do
	#Get current image size
	currentName=${abiVidName[i]}
	resizeTo=$(find "$currentSource" -type f -name "*.jpg" -print0 -quit | xargs -0 identify -format '%w')
	if [[ $resizeTo == '' ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] No images found for $currentName; skipping"
		i=$((i+1))
		continue
	fi
	
	#Calculate necessary scale
	resizeNeeded=0
	while [[ $resizeTo -gt 1500 ]]
	do
		resizeNeeded=1
		resizeTo=$(($resizeTo/2))
	done
	
	echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $currentName..."
	rm /tmp/abi/* > /dev/null 2>&1
	
	#Resize and/or copy file to temporary working directory
	for dateStamp in `seq $oneWeekStartTime $oneWeekEndTime`
	do
		if [[ $resizeNeeded -eq 0 ]]
		then
			find "$currentSource" -type f -regextype posix-extended -name "*_$dateStamp*.jpg" -not -regex ".*"$oneWeekStartTime"T0[0-4].*" -not -regex ".*"$oneWeekEndTime"T(0[5-9]|1[0-9]|2[0-3]).*" -print0 | xargs -0 cp -t /tmp/abi/
		else
			find "$currentSource" -type f -regextype posix-extended -name "*_$dateStamp*.jpg" -not -regex ".*"$oneWeekStartTime"T0[0-4].*" -not -regex ".*"$oneWeekEndTime"T(0[5-9]|1[0-9]|2[0-3]).*" -print0 | xargs -0 mogrify -scale $resizeTo -path /tmp/abi
		fi
	done
	
	#Generate MP4
	rm $videoDir/$currentName.mp4 > /dev/null 2>&1
	ffmpeg -hide_banner -loglevel error -framerate 15 -pattern_type glob -i '/tmp/abi/*.jpg' -c:v libx264 -crf 20 -pix_fmt yuv420p $videoDir/$currentName.mp4
	
	i=$((i+1))
done
