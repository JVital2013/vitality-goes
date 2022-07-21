#!/bin/bash
source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"
yesterdayEmwinText=$(find "$emwinSrcDir" -type f -name "*_$(date --date="yesterday" +"%Y%m%d")*.TXT")
echo $yesterdayEmwinText | xargs zip -j "$emwinSrcDir/$(date --date="yesterday" +"%Y-%m-%d").zip"
echo $yesterdayEmwinText | xargs rm
