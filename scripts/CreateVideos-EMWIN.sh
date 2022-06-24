#!/bin/bash
srcDir="/path/to/goestoolsrepo/emwin"
videoDir="/var/www/html/videos"
codeName=("RADNTHES" "RADREFUS" "GMS008JA" "G16CIRUS" "G10CIRUS" "INDCIRUS")
videoName=("LocalRadar" "USRadar" "HIMAWARI8" "GOES16EMWIN" "GOES17EMWIN" "METEOSAT")
imgconvert=("GIF" "GIF" "GIF" "JPG" "JPG" "JPG")

oneDayStartTime=$(date -u --date="-7 days" +"%Y%m%d")
oneDayEndTime=$(date -u  --date "+1 day" +"%Y%m%d")

cd $videoDir/tmpEMWIN/

#Create Week of EMWIN files
i=0
for currentName in ${videoName[@]}
do
	#Copy down files
	echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $currentName..."
	rm * > /dev/null 2>&1
	
	for dateStamp in `seq $oneDayStartTime $oneDayEndTime`
	do
		cp $srcDir/*_$dateStamp*${codeName[$i]}.${imgconvert[$i]} .  > /dev/null 2>&1
	done
	
	rename 's/^..........................//g' *
	
	#Convert to jpg if needed
	if [ ${imgconvert[$i]} = "JPG" ]
	then
		imgGlob="*.JPG"
	elif [ ${imgconvert[$i]} = "GIF" ]
	then
		mogrify -format png *.GIF
		rm *.GIF
		imgGlob="*.png"
	fi
	
	#Generate MP4
	rm ../$currentName.mp4 > /dev/null 2>&1
	ffmpeg -hide_banner -loglevel error -framerate 15 -pattern_type glob -i "$imgGlob" -c:v libx264 -crf 20 -pix_fmt yuv420p -vf pad="width=ceil(iw/2)*2:height=ceil(ih/2)*2" ../$currentName.mp4
	
	i=$((i+1))
done

echo "[$(date +"%Y-%m-%d %H:%M:%S")] Done!"
