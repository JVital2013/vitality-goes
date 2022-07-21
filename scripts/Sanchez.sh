#!/bin/bash
source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"

#GOES 16
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 16 Sanchez False Color Images"
for srcImg in $(find "$sanchezSrcPath16" -type f)
do
	baseName=$(echo $srcImg | awk -F/ '{print $NF}')
	newName=$(echo $baseName | sed 's/CH13/sanchez/')
	
	nameLastPart=$(echo $baseName | awk -F_ '{print $NF}' | cut -d. -f1)
	thisDate=$(echo $nameLastPart | cut -dT -f1)
	thisTime=$(echo $nameLastPart | cut -dT -f2)
	thisTime=${thisTime::-1}
	
	if [ ! -f $sanchezDstPath16/$newName ]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
		
		#Build Underlay
		rm /tmp/underlay.jpg > /dev/null 2>&1
		xplanet -body earth -projection rectangular -num_times 1 -geometry 10848x5424 -date $thisDate.$thisTime -output /tmp/underlay.jpg
		$sanchezPath -q -s $srcImg -u /tmp/underlay.jpg -o $sanchezDstPath16/$newName
	fi
done

#GOES 17
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 17 Sanchez False Color Images"
for srcImg in $(find "$sanchezSrcPath17" -type f)
do
	baseName=$(echo $srcImg | awk -F/ '{print $NF}')
	newName=$(echo $baseName | sed 's/CH13/sanchez/')
	
	nameLastPart=$(echo $baseName | awk -F_ '{print $NF}' | cut -d. -f1)
	thisDate=$(echo $nameLastPart | cut -dT -f1)
	thisTime=$(echo $nameLastPart | cut -dT -f2)
	thisTime=${thisTime::-1}
	
	if [ ! -f $sanchezDstPath17/$newName ]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
		
		#Build Underlay
		rm /tmp/underlay.jpg > /dev/null 2>&1
		xplanet -body earth -projection rectangular -num_times 1 -geometry 10848x5424 -date $thisDate.$thisTime -output /tmp/underlay.jpg
		$sanchezPath -q -s $srcImg -u /tmp/underlay.jpg -o $sanchezDstPath17/$newName
	fi
done

#Composite
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 16/17 Composite False Color Images"

mkdir -p /tmp/goescomposite
for src17Img in $(find "$sanchezSrcPath17" -type f)
do
	baseName17=$(echo $src17Img | awk -F/ '{print $NF}')
	newName=$(echo $baseName17 | sed 's/GOES17_FD_CH13/goes16_17_composite/')
	
	if [ ! -f $dstPathComposite/$newName ]
	then
		nameLastPart17=$(echo $baseName17 | awk -F_ '{print $NF}' | cut -d. -f1)
		thisDate=$(echo $nameLastPart17 | cut -dT -f1)
		thisTime=$(echo $nameLastPart17 | cut -dT -f2)
		thisTime=${thisTime::-1}
		goes17DateStr=${nameLastPart17::-1}
		
		newestAllowed=$(date -u --date="$thisDate $(echo $thisTime | cut -c 1-2):$(echo $thisTime | cut -c 3-4):$(echo $thisTime | cut -c 5-6) UTC + 15 minutes" +"%Y%m%dT%H%M%S")
		oldestAllowed=$(date -u --date="$thisDate $(echo $thisTime | cut -c 1-2):$(echo $thisTime | cut -c 3-4):$(echo $thisTime | cut -c 5-6) UTC - 15 minutes" +"%Y%m%dT%H%M%S")

		for src16Img in $(find "$sanchezSrcPath16" -type f)
		do
			baseName16=$(echo $src16Img | awk -F/ '{print $NF}')
			nameLastPart16=$(echo $baseName16 | awk -F_ '{print $NF}' | cut -d. -f1)
			goes16DateStr=${nameLastPart16::-1}
			
			if [[ $goes16DateStr == $goes17DateStr || ( $goes16DateStr > $goes17DateStr && $goes16DateStr < $newestAllowed ) || ( $goes16DateStr < $goes17DateStr && $goes16DateStr > $oldestAllowed ) ]]
			then
				echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
				sanchezTime="$(echo $goes16DateStr | cut -c 1-4)-$(echo $goes16DateStr | cut -c 5-6)-$(echo $goes16DateStr | cut -c 7-11):$(echo $goes16DateStr | cut -c 12-13):$(echo $goes16DateStr | cut -c 14-15)"

				#Build Underlay
				rm /tmp/underlay.jpg > /dev/null 2>&1
				xplanet -body earth -projection rectangular -num_times 1 -geometry 10848x5424 -date $thisDate.$thisTime -output /tmp/underlay.jpg
				
				#Render Composite
				rm /tmp/goescomposite/* > /dev/null 2>&1
				cp $src16Img /tmp/goescomposite/
				cp $src17Img /tmp/goescomposite/
				
				$sanchezPath reproject -q -s /tmp/goescomposite/ -u /tmp/underlay.jpg -o $dstPathComposite/$newName -T $sanchezTime -a
				break 
			fi
		done
	fi
done
