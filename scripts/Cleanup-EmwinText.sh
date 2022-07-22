#!/bin/bash
if ! command -v zip &> /dev/null
then
    echo -e "zip could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install zip"
    exit
fi

source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"
yesterdayEmwinText=$(find "$emwinSrcDir" -type f -name "*_$(date --date="yesterday" +"%Y%m%d")*.TXT")
echo $yesterdayEmwinText | xargs zip -j "$emwinSrcDir/$(date --date="yesterday" +"%Y-%m-%d").zip"
echo $yesterdayEmwinText | xargs rm
