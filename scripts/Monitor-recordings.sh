#!/bin/bash
source "$(dirname "$(readlink -fm "$0")")/scriptconfig.ini"
inotifywait -m -e create --format %w%f -r $abiSrcDir
