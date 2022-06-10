#!/bin/bash
inotifywait -m -e create --format %w%f -r /path/to/goestoolsrepo
