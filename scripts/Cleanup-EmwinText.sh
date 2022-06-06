#!/bin/bash
zipStr="$(date --date="yesterday" +"%Y-%m-%d").zip"
blobStart="*$(date --date="yesterday" +"%Y%m%d")"
cd /path/to/goestoolsrepo/emwin

zip $zipStr $(echo $blobStart)0*.TXT
zip $zipStr $(echo $blobStart)1*.TXT
zip $zipStr $(echo $blobStart)2*.TXT
rm $(echo $blobStart)0*.TXT
rm $(echo $blobStart)1*.TXT
rm $(echo $blobStart)2*.TXT
