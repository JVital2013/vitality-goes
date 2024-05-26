# DataHandler API

The core of Vitality GOES is dataHandler.php. The web app uses it behind-the-scenes to query information and load images, and it is not typically used directly. However, it can be used directly by scripts or other programs to query satellite information for further processing. An example of this use is the [Home Assistant configuration](home-assistant.md), where Home Assistant pulls weather information directly from dataHandler.php.

All queries use standard HTTP GET query parameters. At minimum, the `type` parameter must be specified. Type specifies the data you are looking for. Additional parameters may be required, depending on your query type. If type is missing, or any additional parameters are missing/incorrect, no data will be returned. The following `type` parameters are available for general use.

## alertJSON

**Data:** Returns a JSON of all active alerts for your location, as [defined in the alerts documentation](used-emwin-data.md#alerts). Each alert type has its own array, and individual alerts are HTML formatted. Requires EMWIN data.
**Return Type:** JSON
**Additional Parameters:** None

#### Example query

```
http://www.example.com/dataHander.php?type=alertJSON
```

## data

**Data:** Returns the requested type of image. The response headers contain the original filename on disk, and the image is in the same format as it is saved on the server.
**Return type:** Image (usually png, jpg, or gif)
**Additional Parameters:**
* `id`: The unique ID of the image category [as specified in config.ini](config.md#categories)
* `subid`: The unique identifier of the [image section specified in your image ini file](config.md#image-sections).
* `timestamp`: (Optional) the UNIX timestamp of the image you want to load. Must be exact! You can find available timestamps with a `metadata` query. If omitted, the most recent image is loaded

#### Example queries

```
http://www.example.com/dataHandler.php?type=data&id=abi&subid=fdfc_16
http://www.example.com/dataHandler.php?type=data&id=abi&subid=fdfc_16&timestamp=1716681621
http://www.example.com/dataHandler.php?type=data&id=nws&subid=CAR&timestamp=1716678000
```

## hurricaneJSON

**Data:** Returns a JSON of all active tropical storms/hurricanes, their current location, speed, direction, wind speed, and more.  Requires that EMWIN data is available and configured in your [config.ini file](config.md).
**Return Type:** JSON
**Additional Parameters:** None

#### Example query

```
http://www.example.com/dataHander.php?type=hurricaneJSON
```

## localRadarData

**Data:** Local radar image, as defined by `radarCode` [as specified in config.ini](config.md#location). Requires EMWIN data.
**Return type:** Image (GIF)
**Additional Parameters:**
* `timestamp`: the UNIX timestamp of the image you want to load. Must be exact! You can find available timestamps with a `weatherJSON` query.

#### Example query

```
http://www.example.com/dataHandler.php?type=localRadarData&timestamp=1716750055
```

## metadata

**Data:** Various types of data, dependent on the `id` specified.
**Return type:** JSON
**Additional Parameters:**

* `id`: Can be any one of the following values:
  * `packetsContent`, `viterbiContent`, `rsContent`, `gainContent`, `freqContent`, or `omegaContent`: Retrieves statistics about goesrecv's demodulation/decoding status, including chart SVGs. Requires goestools with [Graphite](graphite.md) configured.
  * `otherEmwin`: Pulls all data configured in otheremwin.ini, as well as the EMWIN license and most recent admin message. Additionally, this query returns all satellites available in the most recent EMWIN TLE file, and a list of all unique EMWIN text products currently available. Requires that EMWIN data is available and configured in your [config.ini file](config.md).
  * `sysInfo`: System information about the server running Vitality GOES, including Operating System, system resource utilization, system temps, decoder program status, and SatDump decoder statistics (if using SatDump). Requires that `showSysInfo` is set to true in your [config.ini file](config.md).
  * You can also specify one of your [configured category IDs](config.md#categories) as the id. If you are querying category metadata, `subid` must also be specified. Returns the title of the given product, as well as an array of all available timestamps on the server.
* `subid`: If a category id is specified, this parameter must also be specified to select the [image section specified in your image ini file](config.md#image-sections) by its unique identifier.

#### Example queries

```
http://www.example.com/dataHander.php?type=metadata&id=abi&subtype=fdfc_16
http://www.example.com/dataHander.php?type=metadata&id=meso&subid=m1ch02_16
http://www.example.com/dataHander.php?type=metadata&id=sysInfo
```

## preload

**Data:** An object that outlines the type of data available from the server
**Return type:** JSON
**Additional Parameters:** none

#### Example query

```
http://www.example.com/dataHander.php?type=preload
```

## tle

**Data:** Downloads the most recent TLE set received.  Requires that EMWIN data is available and configured in your [config.ini file](config.md).
**Return type:** TLE
**Additional Parameters:** none

#### Example query

```
http://www.example.com/dataHander.php?type=tle
```

## weatherJSON

**Data:** Returns a JSON of current weather conditions, 7 day forecasts, and a list of available radar images and their timestamps. Requires that EMWIN data is available and configured in your [config.ini file](config.md), and a location is set.
**Return Type:** JSON
**Additional Parameters:** None

#### Example query

```
http://www.example.com/dataHander.php?type=hurricaneJSON
```
