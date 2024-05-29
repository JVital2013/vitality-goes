#!/bin/bash
if ! command -v ffmpeg &> /dev/null
then
    echo -e "ffmpeg could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install ffmpeg"
    exit
fi

#Load config
source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"

#Verify Config is valid
if [[ ${#emwinCodeName[@]} -ne ${#emwinVideoName[@]} ]]
then
	echo "emwinCodeName and emwinVideoName must have the same number of elements in scriptconfig.ini"
	exit
fi

#Cleanup handler
trap cleanup INT
function cleanup() {
    rm -f /tmp/emwin.txt
    exit
}

oneDayStartTime=$(date -u --date="-7 days" +"%Y%m%d")
oneDayEndTime=$(date -u  --date "+1 day" +"%Y%m%d")

#Create Week of EMWIN files
i=0
for currentName in ${emwinVideoName[@]}
do
	echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $currentName..."
	
	#Find and order files
	rm /tmp/emwin.txt > /dev/null 2>&1
	for dateStamp in `seq $oneDayStartTime $oneDayEndTime`
	do
		find "$emwinSrcDir" -type f -name "*_$dateStamp*${emwinCodeName[$i]}*" | sed -r 's/.*\/[A-Z]_[A-Z0-9]{16}_[A-Z]_[A-Z]{4}_([0-9]{14})_[0-9]{6}\-[0-9]\-[A-Z0-9]{8}\.[A-Z0-9]{3}/\1 &/' | sort | sed -r "s/[0-9]{14} (.*)/file '\1'\nduration 0.0666667/" >> /tmp/emwin.txt
	done
	
	#Generate MP4
	rm $videoDir/$currentName.mp4 > /dev/null 2>&1
	ffmpeg -hide_banner -loglevel error -f concat -safe 0 -i /tmp/emwin.txt -c:v libx264 -crf 20 -pix_fmt yuv420p -vf pad="width=ceil(iw/2)*2:height=ceil(ih/2)*2" -r 15 $videoDir/$currentName.mp4
	
	i=$((i+1))
done

echo "[$(date +"%Y-%m-%d %H:%M:%S")] Done!"
cleanup