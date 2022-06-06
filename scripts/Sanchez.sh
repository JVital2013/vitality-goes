#!/bin/bash
srcPath16=/path/to/goestoolsrepo/goes16/fd/ch13
srcPath17=/path/to/goestoolsrepo/goes17/fd/ch13
dstPath16=/path/to/goestoolsrepo/goes16/fd/sanchez
dstPath17=/path/to/goestoolsrepo/goes17/fd/sanchez
dstPathComposite=/path/to/goestoolsrepo/composite
sanchezPath=~/Programs/sanchez-v1.0.19-linux-x64/Sanchez

#GOES 16
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 16 Sanchez False Color Images"
cd $srcPath16
for srcImg in *
do
	newName=$(echo $srcImg | sed 's/CH13/sanchez/')
	thisDate=$(echo $srcImg | cut -c 16-23)
	thisTime=$(echo $srcImg | cut -c 25-30)
	
	if [ ! -f $dstPath16/$newName ]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
		
		#Build Underlay
		if [ -d /tmp/underlay.jpg ]
		then
			rm /tmp/underlay.jpg
		fi
		
		xplanet -body earth -projection rectangular -num_times 1 -geometry 10848x5424 -date $thisDate.$thisTime -output /tmp/underlay.jpg
		$sanchezPath -q -s $srcPath16/$srcImg -u /tmp/underlay.jpg -o $dstPath16/$newName
	fi
done

#GOES 17
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 17 Sanchez False Color Images"
cd $srcPath17
for srcImg in *
do
	newName=$(echo $srcImg | sed 's/CH13/sanchez/')
	thisDate=$(echo $srcImg | cut -c 16-23)
	thisTime=$(echo $srcImg | cut -c 25-30)
	
	if [ ! -f $dstPath17/$newName ]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
		
		#Build Underlay
		if [ -d /tmp/underlay.jpg ]
		then
			rm /tmp/underlay.jpg
		fi
		
		xplanet -body earth -projection rectangular -num_times 1 -geometry 10848x5424 -date $thisDate.$thisTime -output /tmp/underlay.jpg
		$sanchezPath -q -s $srcPath17/$srcImg -u /tmp/underlay.jpg -o $dstPath17/$newName
	fi
done

#Composite
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 16/17 Composite False Color Images"
if [ -d /tmp/goescomposite ]
then
	rm -rf /tmp/goescomposite
fi

mkdir /tmp/goescomposite

for src17Img in $srcPath17/*
do
	newName=$(echo $src17Img | sed 's/goes17\/fd\/ch13/composite/' | sed 's/GOES17_FD_CH13/goes16_17_composite/')
	if [ ! -f $newName ]
	then
		thisDate=$(echo $src17Img | cut -c 66-73)
		thisTime=$(echo $src17Img | cut -c 75-80)
		goes17DateStr=$(echo $src17Img | cut -c 66-80)
		newestAllowed=$(date -u --date="$thisDate $(echo $src17Img | cut -c 75-76):$(echo $src17Img | cut -c 77-78):$(echo $src17Img | cut -c 79-80) UTC + 15 minutes" +"%Y%m%dT%H%M%S")
		oldestAllowed=$(date -u --date="$thisDate $(echo $src17Img | cut -c 75-76):$(echo $src17Img | cut -c 77-78):$(echo $src17Img | cut -c 79-80) UTC - 15 minutes" +"%Y%m%dT%H%M%S")

		for src16Img in $srcPath16/*
		do
			goes16DateStr=$(echo $src16Img | cut -c 66-80)
			
			if [[ $goes16DateStr == $goes17DateStr || ( $goes16DateStr > $goes17DateStr && $goes16DateStr < $newestAllowed ) || ( $goes16DateStr < $goes17DateStr && $goes16DateStr > $oldestAllowed ) ]]
			then
				echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
				sanchezTime="$(echo $src16Img | cut -c 66-69)-$(echo $src16Img | cut -c 70-71)-$(echo $src16Img | cut -c 72-76):$(echo $src16Img | cut -c 77-78):$(echo $src16Img | cut -c 79-80)"
				
				#Build Underlay
				if [ -d /tmp/underlay.jpg ]
				then
					rm /tmp/underlay.jpg
				fi
				
				xplanet -body earth -projection rectangular -num_times 1 -geometry 10848x5424 -date $thisDate.$thisTime -output /tmp/underlay.jpg
				
				#Render Composite
				cp $src16Img /tmp/goescomposite/
				cp $src17Img /tmp/goescomposite/
				
				$sanchezPath reproject -q -s /tmp/goescomposite/ -u /tmp/underlay.jpg -o $newName -T $sanchezTime -a
				rm /tmp/goescomposite/*
				
				break 
			fi
		done
	fi
done