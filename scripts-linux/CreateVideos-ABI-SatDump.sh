#!/bin/bash
if ! command -v convert &> /dev/null
then
	echo -e "convert could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install imagemagick"
	exit
fi
if ! command -v ffmpeg &> /dev/null
then
	echo -e "ffmpeg could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install ffmpeg"
	exit
fi

source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"

#Verify Config is valid
if [[ ${#abiImgSource[@]} -ne ${#abiVidName[@]} || ${#abiImgSource[@]} -ne ${#abiImgFilter[@]} ]]
then
	echo "abiImgSource, abiVidName, and abiImgFilter must have the same number of elements in scriptconfig.ini"
	exit
fi

today=$(date --date="today" +"%F")
oneWeekStartTime=$(date -u --date="$today - 7 days" +"%Y-%m-%d")
oneWeekEndTime=$(date -u --date="$today" +"%Y-%m-%d")

mkdir -p /tmp/abi

#Create 1 Week of ABI Videos
i=0
for currentSource in "${abiImgSource[@]}"
do
	#Get current image size
	currentName=${abiVidName[i]}
	currentFilter=${abiImgFilter[i]}
	resizeTo=$(find "$currentSource" -type f -regextype posix-extended -regex ".*$currentFilter[^\/]*\.(png|jpg)$" -print0 -quit | xargs -0 identify -format '%w')
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
	for daysBack in `seq 0 7`
	do
		dateStamp=$(date -u --date="$today - $daysBack days" +"%Y-%m-%d")
		imageFiles=()
		mapfile -d $'\0' imageFiles < <(find "$currentSource" -type f -regextype posix-extended -regex ".*$dateStamp.*$currentFilter[^\/]*\.(png|jpg)$" -not -regex ".*"$oneWeekStartTime"_0[0-4].*" -not -regex ".*"$oneWeekEndTime"_(0[5-9]|1[0-9]|2[0-3]).*" -print0)
		for thisFile in "${imageFiles[@]}"
		do
			thisDate="$(basename "$(dirname "$thisFile")")"
			extension="${thisFile##*.}"
			if [[ $resizeNeeded -eq 0 ]]
			then
				cp "$thisFile" /tmp/abi/$thisDate.$extension
			else
				convert "$thisFile" -scale $resizeTo /tmp/abi/$thisDate.$extension
			fi
		done
	done

	# Generate MP4
	rm $videoDir/$currentName.mp4 > /dev/null 2>&1

	ffmpeg -hide_banner -loglevel error -framerate 15 -pattern_type glob -i "/tmp/abi/*.$extension" -vf 'pad=width=ceil(iw/2)*2:height=ceil(ih/2)*2,minterpolate=fps=60:mi_mode=blend:me_mode=bidir:mc_mode=obmc:me=ds:vsbmc=1' -c:v libx264 -crf 20 -pix_fmt yuv420p $videoDir/$currentName.mp4
	i=$((i+1))
done
