#!/bin/bash
if ! command -v inotifywait &> /dev/null
then
    echo -e "inotifywait could not be found, which is required for this script\n\nTry installing it with this command:\nsudo apt install inotify-tools"
    exit
fi

source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"
inotifywait -m -e create --format %w%f -r $abiSrcDir
