#!/bin/bash
srcDir="/path/to/goestoolsrepo"
videoDir="/var/www/html/videos"
imgSource=("$srcDir/goes16/fd/fc" "$srcDir/goes16/fd/fc-noborder" "$srcDir/goes16/fd/ch02" "$srcDir/goes16/fd/ch07" "$srcDir/goes16/fd/ch07_enhanced" "$srcDir/goes16/fd/ch08" "$srcDir/goes16/fd/ch08_enhanced" "$srcDir/goes16/fd/ch09" "$srcDir/goes16/fd/ch09_enhanced" "$srcDir/goes16/fd/ch13" "$srcDir/goes16/fd/ch13_enhanced" "$srcDir/goes16/fd/ch14" "$srcDir/goes16/fd/ch14_enhanced" "$srcDir/goes16/fd/ch15" "$srcDir/goes16/fd/ch15_enhanced" "$srcDir/goes17/fd/ch13" "$srcDir/goes17/fd/ch13_enhanced" "$srcDir/goes17/fd/sanchez" "$srcDir/goes16/non-cmip/fd/acha" "$srcDir/goes16/non-cmip/fd/acht" "$srcDir/goes16/non-cmip/fd/dsi" "$srcDir/goes16/non-cmip/fd/lst" "$srcDir/goes16/non-cmip/fd/rrqpe" "$srcDir/goes16/non-cmip/fd/sst" "$srcDir/goes16/non-cmip/fd/tpw" "$srcDir/goes16/m1/fc" "$srcDir/goes16/m1/fc-noborder" "$srcDir/goes16/m1/ch02" "$srcDir/goes16/m1/ch07" "$srcDir/goes16/m1/ch07_enhanced" "$srcDir/goes16/m1/ch13" "$srcDir/goes16/m1/ch13_enhanced" "$srcDir/goes16/m2/fc" "$srcDir/goes16/m2/fc-noborder" "$srcDir/goes16/m2/ch02" "$srcDir/goes16/m2/ch07" "$srcDir/goes16/m2/ch07_enhanced" "$srcDir/goes16/m2/ch13" "$srcDir/goes16/m2/ch13_enhanced" "$srcDir/goes16/fd/sanchez" "$srcDir/composite")
vidName=("GOES16FalseColor" "GOES16FalseColorNoBorders" "GOES16Ch2" "GOES16Ch7" "GOES16Ch7Enhanced" "GOES16Ch8" "GOES16Ch8Enhanced" "GOES16Ch9" "GOES16Ch9Enhanced" "GOES16Ch13" "GOES16Ch13Enhanced" "GOES16Ch14" "GOES16Ch14Enhanced" "GOES16Ch15" "GOES16Ch15Enhanced" "GOES17Ch13" "GOES17Ch13Enhanced" "GOES17Sanchez" "GOES16acha" "GOES16acht" "GOES16dsi" "GOES16lst" "GOES16rrqpe" "GOES16sst" "GOES16tpw" "GOES16FalseColor_M1" "GOES16FalseColorNoBorders_M1" "GOES16Ch2_M1" "GOES16Ch7_M1" "GOES16Ch7Enhanced_M1" "GOES16Ch13_M1" "GOES16Ch13Enhanced_M1" "GOES16FalseColor_M2" "GOES16FalseColorNoBorders_M2" "GOES16Ch2_M2" "GOES16Ch7_M2" "GOES16Ch7Enhanced_M2" "GOES16Ch13_M2" "GOES16Ch13Enhanced_M2" "GOES16Sanchez" "Composite")
resizeMode=(0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3 0 3 3 0 0 3 1 1 1 3 3 3 3 1 1 1 3 3 3 3 0 2)

today=$(date --date="today" +"%F")
oneWeekStartTime=$(date -u --date="$today - 7 days" +"%Y%m%d")
oneWeekEndTime=$(date -u --date="$today" +"%Y%m%d")

cd $videoDir/tmpABI/

#Create 1 Week of Full Disk Videos
i=0
for currentSource in ${imgSource[@]}
do
	#Copy down files
	currentName=${vidName[i]}
	echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $currentName..."
	rm * > /dev/null 2>&1
	
	for dateStamp in `seq $oneWeekStartTime $oneWeekEndTime`
	do
		cp $currentSource/*_$dateStamp*.jpg .
	done
	
	#Trim off extra frames at the beginning and end
	for hour in {00..04}
	do
		rm *${oneWeekStartTime}T$hour*.jpg > /dev/null 2>&1
	done
	for hour in {05..23}
	do
		rm *${oneWeekEndTime}T$hour*.jpg > /dev/null 2>&1
	done
	
	#Shrink images if specified
	if [ ${resizeMode[$i]} = 0 ]; then
		mogrify -resize 1356 *.jpg
	elif [ ${resizeMode[$i]} = 1 ]; then
		mogrify -resize 1000 *.jpg
	elif [ ${resizeMode[$i]} = 2 ]; then
		mogrify -resize 1402x954 *.jpg
	fi
	
	#Generate MP4
	rm ../$currentName.mp4 > /dev/null 2>&1
	ffmpeg -hide_banner -loglevel error -framerate 15 -pattern_type glob -i '*.jpg' -c:v libx264 -crf 20 -pix_fmt yuv420p ../$currentName.mp4
	
	i=$((i+1))
done
