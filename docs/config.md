# How to Configure Vitality GOES

The Vitality GOES config is stored in `html/config` and is broken out into these files:

* **config.ini**: The main configuration file
* **emwin.ini**: Stores information about the emwin images you want to display. This file has no effect on emwin text that is displayed
* **abi.ini**: Contains information about your full-disk images. If you're doing any Sanchez renders, I'd put them in this file as well
* **meso.ini**: Contains information about your mesoscale images.
* **l2.ini**: Contains infromation about your ABI level 2 products. These images contain information about estimated rainfall, land surface temp, sea surface temp, and more. Note that goestools does not receive these unless your goesproc config is set up to do so. The sample config in this repository is configured correctly, but if you're not saving these files, simply leave l2.ini empty.

These ini files are parsed with the php [parse_ini_file](https://www.php.net/manual/en/function.parse-ini-file.php) function, so any comments must begin with a semicolon (;).

## config.ini

### General
* `graphiteAPI`: Change this line to point to your graphite host. It must include the `/render/` path at the end to work properly. If you're not using Graphite, comment this line out with a ;
* `emwinPath`: Change this line to point to the emwin repository of your choice. If you're picking up both GOES West and East, you can use either EMWIN locaiton. Comment this line out with a ; to disable EMWIN data
* `adminPath`: Change this line to point to the directory with admin text you want to display. Comment this line out with a ; to disable admin text
* `showSysInfo`: Change this to false if Vitality GOES is on a different system than goestools. Otherwise, leave it to True

### Paths
The Paths section is unnecessary, but it is recommended that you set up a path for each satellite you're receiving. There's more about that in the Wiki (TODO). If you're only picking up GOES 16, you can leave this alone.

### Location
This section contains information about your physical location. If you're not displaying EMWIN data, the only thing you need to configure is timezone. A list of supported timezones can be found [here](https://www.php.net/manual/en/timezones.php).
