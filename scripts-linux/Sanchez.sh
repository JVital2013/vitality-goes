#!/bin/bash
source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"

#Make sure needed commands are available
if ! command -v xplanet &> /dev/null
then
    echo -e "xplanet could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install xplanet"
    exit
fi
if ! command -v identify &> /dev/null
then
    echo -e "identify could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install imagemagick"
    exit
fi
if ! command -v $sanchezPath &> /dev/null
then
    echo -e "Sanchez could not be found at $sanchezPath. Please make sure\nit's downloaded and properly configured in scriptconfig.ini"
    exit
fi

#Only needed sometimes commands
if ! command -v wget &> /dev/null
then
    echo -e "wget could not be found.  This is fine if all underlay\nimages are already downloaded. If not, the script will\ncrash. Please install wget with this command:\n\nsudo apt install wget\n"
fi

#Check if cached image/config directory is available
if [[ ! -d "$(dirname "$(readlink -fm "$0")")/Resources" ]]
then
	echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating directory for underlay cache..."
	mkdir -p "$(dirname "$(readlink -fm "$0")")/Resources"
fi

#Download night map
if [[ ! -f "$(dirname "$(readlink -fm "$0")")/Resources/dnb_land_ocean_ice.2012.21600x10800_geo.jpg" ]]
then
	echo "[$(date +"%Y-%m-%d %H:%M:%S")] Downloading dnb_land_ocean_ice.2012.21600x10800_geo.jpg"
	wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/dnb_land_ocean_ice.2012.21600x10800_geo.jpg" https://www.dropbox.com/s/cu4g3sbfngjomgk/dnb_land_ocean_ice.2012.21600x10800_geo.jpg?dl=1
	
	#Verify the file downloaded
	if [[ ! -f "$(dirname "$(readlink -fm "$0")")/Resources/dnb_land_ocean_ice.2012.21600x10800_geo.jpg" ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] $(dirname "$(readlink -fm "$0")")/Resources/dnb_land_ocean_ice.2012.21600x10800_geo.jpg could not be found or downloaded. Exiting!"
		exit
	fi
fi

#Generate XPlanet configs and download daytime maps, if needed
for i in $(seq -w 01 12)
do
	if [[ ! -f "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.2004$i.3x21600x10800.jpg" ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Downloading world.topo.2004$i.3x21600x10800.jpg..."
		case $i in
			01) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200401.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74243/world.topo.200401.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200401.3x21600x10800.jpg" ;;
			02) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200402.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74268/world.topo.200402.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200402.3x21600x10800.jpg" ;;
			03) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200403.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74293/world.topo.200403.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200403.3x21600x10800.jpg" ;;
			04) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200404.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74318/world.topo.200404.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200404.3x21600x10800.jpg" ;;
			05) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200405.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74343/world.topo.200405.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200405.3x21600x10800.jpg" ;;
			06) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200406.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74368/world.topo.200406.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200406.3x21600x10800.jpg" ;;
			07) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200407.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74393/world.topo.200407.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200407.3x21600x10800.jpg" ;;
			08) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200408.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74418/world.topo.200408.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200408.3x21600x10800.jpg" ;;
			09) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200409.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74443/world.topo.200409.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200409.3x21600x10800.jpg" ;;
			10) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200410.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74468/world.topo.200410.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200410.3x21600x10800.jpg" ;;
			11) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200411.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74493/world.topo.200411.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200411.3x21600x10800.jpg" ;;
			12) wget -q -O "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200412.3x21600x10800.jpg" https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74518/world.topo.200412.3x21600x10800.jpg || rm "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.200412.3x21600x10800.jpg" ;;
		esac
		
		#Verify the file downloaded
		if [[ ! -f "$(dirname "$(readlink -fm "$0")")/Resources/world.topo.2004$i.3x21600x10800.jpg" ]]
		then
			echo "[$(date +"%Y-%m-%d %H:%M:%S")] $(dirname "$(readlink -fm "$0")")/Resources/world.topo.2004$i.3x21600x10800.jpg could not be found or downloaded. Exiting!"
			exit
		fi
	fi
	
	if [[ ! -f "$(dirname "$(readlink -fm "$0")")/Resources/xplanet-$i" ]]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Generating XPlanet config for world.topo.2004$i.3x21600x10800.jpg"
		echo -e "[default]\nbump_scale=1\ncloud_ssec=false\ncloud_threshold=90\ncolor={255,255,255}\nmagnify=1\norbit={-.5,.5,2}\norbit_color={255,255,255}\nrandom_origin=true\nrandom_target=true\nshade=30\ntwilight=6\n" > "$(dirname "$(readlink -fm "$0")")/Resources/xplanet-$i"
		echo -e "[earth]\nmap=$(dirname "$(readlink -fm "$0")")/Resources/world.topo.2004$i.3x21600x10800.jpg\nnight_map=$(dirname "$(readlink -fm "$0")")/Resources/dnb_land_ocean_ice.2012.21600x10800_geo.jpg" >> "$(dirname "$(readlink -fm "$0")")/Resources/xplanet-$i"
	fi
done

#GOES 16
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 16 Sanchez False Color Images"
for srcImg in $(find "$sanchezSrcPath16" -type f)
do
	baseName=$(echo $srcImg | awk -F/ '{print $NF}')
	! [[ "$baseName" =~ ^.*_[0-9]{8}T[0-9]{6}Z\.[A-Za-z]{3}$ ]] && continue
	
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
		satelliteMonth=$(date -u -d "$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} + 5 hour" +"%m")
		xplanet -config "$(dirname "$(readlink -fm "$0")")/Resources/xplanet-$satelliteMonth" -body earth -projection rectangular -num_times 1 -geometry 21600x10800 -date $thisDate.$thisTime -output /tmp/underlay.jpg
		$sanchezPath -q -s $srcImg -u /tmp/underlay.jpg -r $((10850/$(identify -format '%w' $srcImg))) -n -o $sanchezDstPath16/$newName
	fi
done

#GOES 17
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 17 Sanchez False Color Images"
for srcImg in $(find "$sanchezSrcPath17" -type f)
do
	baseName=$(echo $srcImg | awk -F/ '{print $NF}')
	! [[ "$baseName" =~ ^.*_[0-9]{8}T[0-9]{6}Z\.[A-Za-z]{3}$ ]] && continue
	
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
		satelliteMonth=$(date -u -d "$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} + 8 hour" +"%m")
		xplanet -config "$(dirname "$(readlink -fm "$0")")/Resources/xplanet-$satelliteMonth" -body earth -projection rectangular -num_times 1 -geometry 21600x10800 -date $thisDate.$thisTime -output /tmp/underlay.jpg
		$sanchezPath -q -s $srcImg -u /tmp/underlay.jpg -r $((10850/$(identify -format '%w' $srcImg))) -n -o $sanchezDstPath17/$newName
	fi
done

#GOES 18
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 18 Sanchez False Color Images"
for srcImg in $(find "$sanchezSrcPath18" -type f)
do
	baseName=$(echo $srcImg | awk -F/ '{print $NF}')
	! [[ "$baseName" =~ ^.*_[0-9]{8}T[0-9]{6}Z\.[A-Za-z]{3}$ ]] && continue
	
	newName=$(echo $baseName | sed 's/CH13/sanchez/')
	nameLastPart=$(echo $baseName | awk -F_ '{print $NF}' | cut -d. -f1)
	thisDate=$(echo $nameLastPart | cut -dT -f1)
	thisTime=$(echo $nameLastPart | cut -dT -f2)
	thisTime=${thisTime::-1}
	
	if [ ! -f $sanchezDstPath18/$newName ]
	then
		echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
		
		#Build Underlay
		rm /tmp/underlay.jpg > /dev/null 2>&1
		satelliteMonth=$(date -u -d "$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} + 8 hour" +"%m")
		xplanet -config "$(dirname "$(readlink -fm "$0")")/Resources/xplanet-$satelliteMonth" -body earth -projection rectangular -num_times 1 -geometry 21600x10800 -date $thisDate.$thisTime -output /tmp/underlay.jpg
		$sanchezPath -q -s $srcImg -u /tmp/underlay.jpg -r $((10850/$(identify -format '%w' $srcImg))) -n -o $sanchezDstPath18/$newName
	fi
done

#Composite 16/17
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 16/17 Composite False Color Images"

mkdir -p /tmp/goescomposite
for src17Img in $(find "$sanchezSrcPath17" -type f)
do
	baseName17=$(echo $src17Img | awk -F/ '{print $NF}')
	! [[ "$baseName17" =~ ^.*_[0-9]{8}T[0-9]{6}Z\.[A-Za-z]{3}$ ]] && continue
	
	newName=$(echo $baseName17 | sed 's/GOES17_FD_CH13/goes16_17_composite/')
	if [ ! -f $dstPathComposite/$newName ]
	then
		nameLastPart17=$(echo $baseName17 | awk -F_ '{print $NF}' | cut -d. -f1)
		thisDate=$(echo $nameLastPart17 | cut -dT -f1)
		thisTime=$(echo $nameLastPart17 | cut -dT -f2)
		thisTime=${thisTime::-1}
		goes17DateStr=${nameLastPart17::-1}
		
		newestAllowed=$(date -u --date="$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} UTC + 15 minutes" +"%Y%m%dT%H%M%S")
		oldestAllowed=$(date -u --date="$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} UTC - 15 minutes" +"%Y%m%dT%H%M%S")

		for src16Img in $(find "$sanchezSrcPath16" -type f)
		do
			baseName16=$(echo $src16Img | awk -F/ '{print $NF}')
			! [[ "$baseName16" =~ ^.*_[0-9]{8}T[0-9]{6}Z\.[A-Za-z]{3}$ ]] && continue
			
			nameLastPart16=$(echo $baseName16 | awk -F_ '{print $NF}' | cut -d. -f1)
			goes16DateStr=${nameLastPart16::-1}
			
			if [[ $goes16DateStr == $goes17DateStr || ( $goes16DateStr > $goes17DateStr && $goes16DateStr < $newestAllowed ) || ( $goes16DateStr < $goes17DateStr && $goes16DateStr > $oldestAllowed ) ]]
			then
				echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
				sanchezTime="${goes16DateStr:0:4}-${goes16DateStr:4:2}-${goes16DateStr:6:5}:${goes16DateStr:11:2}:${goes16DateStr:13:2}"
				
				#Build Underlay
				rm /tmp/underlay.jpg > /dev/null 2>&1
				satelliteMonth=$(date -u -d "$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} + 6 hour" +"%m")
				xplanet -config "$(dirname "$(readlink -fm "$0")")/Resources/xplanet-$satelliteMonth" -body earth -projection rectangular -num_times 1 -geometry 21600x10800 -date $thisDate.$thisTime -output /tmp/underlay.jpg
				
				#Render Composite
				rm /tmp/goescomposite/* > /dev/null 2>&1
				cp $src16Img /tmp/goescomposite/
				cp $src17Img /tmp/goescomposite/
				
				$sanchezPath reproject -q -s /tmp/goescomposite/ -u /tmp/underlay.jpg -n -o $dstPathComposite/$newName -T $sanchezTime -a
				break 
			fi
		done
	fi
done

#Composite 16/18
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating GOES 16/18 Composite False Color Images"

mkdir -p /tmp/goescomposite
for src18Img in $(find "$sanchezSrcPath18" -type f)
do
	baseName18=$(echo $src18Img | awk -F/ '{print $NF}')
	! [[ "$baseName18" =~ ^.*_[0-9]{8}T[0-9]{6}Z\.[A-Za-z]{3}$ ]] && continue
	
	newName=$(echo $baseName18 | sed 's/GOES18_FD_CH13/goes16_18_composite/')
	if [ ! -f $dstPathComposite/$newName ]
	then
		nameLastPart18=$(echo $baseName18 | awk -F_ '{print $NF}' | cut -d. -f1)
		thisDate=$(echo $nameLastPart18 | cut -dT -f1)
		thisTime=$(echo $nameLastPart18 | cut -dT -f2)
		thisTime=${thisTime::-1}
		goes18DateStr=${nameLastPart18::-1}
		
		newestAllowed=$(date -u --date="$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} UTC + 15 minutes" +"%Y%m%dT%H%M%S")
		oldestAllowed=$(date -u --date="$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} UTC - 15 minutes" +"%Y%m%dT%H%M%S")

		for src16Img in $(find "$sanchezSrcPath16" -type f)
		do
			baseName16=$(echo $src16Img | awk -F/ '{print $NF}')
			! [[ "$baseName16" =~ ^.*_[0-9]{8}T[0-9]{6}Z\.[A-Za-z]{3}$ ]] && continue
			
			nameLastPart16=$(echo $baseName16 | awk -F_ '{print $NF}' | cut -d. -f1)
			goes16DateStr=${nameLastPart16::-1}
			
			if [[ $goes16DateStr == $goes18DateStr || ( $goes16DateStr > $goes18DateStr && $goes16DateStr < $newestAllowed ) || ( $goes16DateStr < $goes18DateStr && $goes16DateStr > $oldestAllowed ) ]]
			then
				echo "[$(date +"%Y-%m-%d %H:%M:%S")] Creating $newName..."
				sanchezTime="${goes16DateStr:0:4}-${goes16DateStr:4:2}-${goes16DateStr:6:5}:${goes16DateStr:11:2}:${goes16DateStr:13:2}"

				#Build Underlay
				rm /tmp/underlay.jpg > /dev/null 2>&1
				satelliteMonth=$(date -u -d "$thisDate ${thisTime:0:2}:${thisTime:2:2}:${thisTime:4:2} + 6 hour" +"%m")
				xplanet -config "$(dirname "$(readlink -fm "$0")")/Resources/xplanet-$satelliteMonth" -body earth -projection rectangular -num_times 1 -geometry 21600x10800 -date $thisDate.$thisTime -output /tmp/underlay.jpg
				
				#Render Composite
				rm /tmp/goescomposite/* > /dev/null 2>&1
				cp $src16Img /tmp/goescomposite/
				cp $src18Img /tmp/goescomposite/
				
				$sanchezPath reproject -q -s /tmp/goescomposite/ -u /tmp/underlay.jpg -n -o $dstPathComposite/$newName -T $sanchezTime -a
				break 
			fi
		done
	fi
done
