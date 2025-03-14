# Vitality GOES
A Web App for showcasing Geostationary Weather Satellite Data. Vitality GOES is designed to display data received from GOES-16/18/19 satellites via goestools, Satdump, or XRIT Decoder, but images from other satellites can be displayed as well.

**[Click Here for Screenshots and Videos](https://github.com/JVital2013/vitality-goes/wiki/Screenshots-and-Videos)**

**[Traducción al español por XQ6DLW, Demys](docs/Vitality-Goes-traduccion-al-español.pdf)**

![Series of Screenshots of Vitality GOES](https://user-images.githubusercontent.com/24253715/210026593-e3a236f0-f086-40a4-b8e7-52a522b426e5.png)

### Table of Contents
1. [What does Vitality GOES do?](#what-does-vitality-goes-do)
2. [System Requirements](#system-requirements)
3. [Preparing your system for Vitality GOES](#preparing-your-system-for-vitality-goes)
4. [Installing Vitality GOES](#installing-vitality-goes)
5. [Configuring Vitality GOES](#configuring-vitality-goes)
6. [Updating Vitality GOES](#updating-vitality-goes)
7. [Theming](#theming)
8. [Creating configs for other satellites](#creating-configs-for-other-satellites)
9. [Other Documentation](#other-documentation)
10. [Credits](#credits)
11. [Additional Resources](#additional-resources)

## What does Vitality GOES do?

Vitality GOES makes data received from a Geostationary Weather Satellite feed easily accessible, through a web browser, from anywhere on your local network. Even if the internet goes down, people on your local LAN can still access real-time weather information.

Vitality GOES has the following features:

* It is easily usable by anyone with no knowledge of radio, satellites, or programming once set up by a ground station technician (you!).
* Vitality GOES presents all full-disk images, and mesoscale imagery, and more in a user friendly and easily navigatable way.
* Current weather conditions, forecasts, watches, and warnings from the GOES-16/18/19 HRIT/EMWIN data feed are presented to the user in a way that is appealing and easy to read. There is no need to parse through data for other locations: your configured location's data is the only thing you're shown.
* Discover and browse additional data from the EMWIN data feed. For a writeup on the EMWIN data Vitality GOES pulls and how it's used, see [here](docs/used-emwin-data.md).
* Monitor the status of the underlying goestools/SatDump stack, including systems temps, error correction rates, and packet drop rates.

Sample configurations are provided for the following satellite/station setups:

| Satellite Downlink    | Supported Programs                   |
| --------------------- | ------------------------------------ |
| GOES-16/18/19 HRIT    | goestools, SatDump, and XRIT Decoder |
| EWS-G1 (GOES-13) GVAR | SatDump                              |
| FengYun-2x S-VISSR    | SatDump                              |
| GEO-KOMPSAT 2A        | xrit-rx or SatDump                   |

### How does it work?

A satellite downlink is picked up by your satellite dish, and is processed into text and image data by goestools/SatDump. From there, Vitality GOES reads the data and presents it to the user on their device across the local network.

![Flow of Geostationary Weather Data Via Vitality GOES](https://user-images.githubusercontent.com/24253715/210028326-0ad63425-cb31-4489-84ea-83de3a940562.png)

## System Requirements

You need to set up a satellite dish and point it at the satellite of your choice to get started. Additionally, SatDump or goestools must be configured to save recieved data to disk. Guides for setting up these programs can be found under [Additional Resources](#additional-resources).

It is recommended that you host Vitality GOES on your ground station itself for the most up-to-date information and to simplify setup/maintenance. If you choose, it can be hosted on another machine if you have a sync process set up between the ground station and the Vitality GOES server. *Syncing received images from another machine is outside the scope of Vitality GOES.*

It is also recommended that you use a Debian-based Linux distro to host the Vitality GOES server. Something like Raspberry Pi OS, Ubuntu, or Debian is preferred. If you host it on Windows, make sure your satellite data is on an NTFS drive.

If you enable the secondary scripts, you may need more processing power than a low-end machine (like a Raspberry Pi) can provide. You may need to offload video rendering tasks to another machine or upgrade your server to something beefier. I'm using a laptop with a 4th generation Core i5 processor, and it has more than enough power to run goestools, Vitality GOES, and all secondary scripts.

Once configured, any modern web browser can connect to Vitality GOES and view the data. Anyone with access to your server can view the data with ease!

## Preparing your system for Vitality GOES

### Option 1: SatDump
You can use SatDump as a data source without changing any of its configurations. While SatDump can be run interactively with a full UI, this is not recommended for long-term realtime decoding. Instead, you should launch satdump in cli mode for live decoding. Here is an example SatDump command to use an RTL-SDR to pick up GOES-16/18/19:

```
satdump live goes_hrit F:\path\to\satdumprepo --source rtlsdr --samplerate 2.4e6 --frequency 1694.1e6 --gain 49 --http_server 0.0.0.0:8080 --fill_missing
```

The `http_server` part is optional and is only needed to provide decoder/demodulator statistics to Vitality GOES. For more information, see [the config documentation](/docs/config.md#general).

### Option 2: goestools
To assist you in configuring goestools for Vitality GOES, sample `goesrecv.conf` and `goesproc-goesr.conf` files have been included in the configs folder of this repository. These files are pretty close to "stock" suggested files. You do not need to use these exact configs. You might want to remove sections you won't be using, and you'll need do do a "Find & Replace" to update the directory to where you want your GOES products stored. In the end, your setup should be configured as follows:

* In goesproc-goesr.conf, image handlers should have the filename end in `{time:%Y%m%dT%H%M%SZ}`.
* While all EMWIN information will be in the same folder, other product types should each have their own folder for best performance. For example, Channel 2 images should be in their own folder and not co-mingled with false color images.
* If will be enabling EMWIN information in Vitality GOES, make sure you have the emwin handler enabled in `goesproc-goesr.conf`. Do not exclude text files in this handler.
* If you plan on tracking satellite decoding statistics, make sure your `goesrecv.conf` file has a `statsd_address` defined where you are hosting Graphite/statsd. See [See the advanced configuration section](#advanced-configurations-for-goestools) for info on how to set up Graphite/statsd. You can configure this later.

### Option 3: XRIT Decoder
Thanks to @abomb60, data from USA-Satcom's XRIT Decoder is supported as well.

### Vitality GOES Dependencies
Vitality GOES needs to be hosted on a web server stack. Recommended software versions:

 - **Web Server:** Apache2
 - **PHP Version:** PHP 8.0+ (PHP 7.4 is supported)

For this readme, I'm going to assume you're not running another web server on the same machine.

---

#### Linux
Assuming you're on a Debian/Ubuntu-based server, the following commands should install all the dependencies you need:

```
sudo apt update
sudo apt upgrade
sudo apt install apache2 php libapache2-mod-php
sudo a2enmod rewrite
sudo systemctl restart apache2
```

You may also need to enable .htaccess files in Apache2 for all functionality to work. To do so, edit /etc/apache2/apache2.conf as root and update this section:

```apache
<Directory /var/www/>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
</Directory>
```

to this:

```apache
<Directory /var/www/>
        Options -Indexes
        AllowOverride All
        Require all granted
</Directory>
```

Finally, you need to make sure Apache has read access to your satellite data. There are two ways to do this. If your data is somewhere in your user folder (ex. /home/pi), you can give the `www-data` user access to your user folder. To do so, run these commands (replacing pi with your username):

```bash
sudo usermod -a -G pi www-data
chmod 0750 /home/pi
sudo systemctl restart apache2
```

The other option is to configure your receiving program to save your data elsewhere (ex, /var/lib/satdata), and set your permissions as appropriate.

#### Windows
The easiest way to host Vitality GOES on a Windows box is to use XAMPP ([https://www.apachefriends.org/](https://www.apachefriends.org/)). Download and install this software. When prompted, the only parts that are needed are Apache and PHP. Don't forget to start the Apache service in the XAMPP control panel before continuing.

---

Afterwards, verify your web server is working. When you navigate to the IP of your Vitality GOES server, you should see something that looks like this:

![Demo Apache2 Page](https://user-images.githubusercontent.com/24253715/210030857-c5ff8d12-a749-4d78-8d68-9ec4e5c6c21c.png)

## Installing Vitality GOES

### Linux
In a command line, run the following commands:

```
sudo rm -rf /var/www/html
git clone https://github.com/JVital2013/vitality-goes
cd vitality-goes
cp -r html /var/www/html
```
Then, copy a set of example configuration files from the configs folder of this repo into /var/www/html/config. Take a look at the [config readme](docs/config.md) for more.

### Windows
To start hosing Vitality GOES in Windows:

1. Download a zip of the Vitality GOES git repository ([link for the lazy](https://github.com/JVital2013/vitality-goes/archive/refs/heads/main.zip))
2. Extract the zip
3. Delete the contents of C:\xampp\htdocs\
4. Copy the contents of vitality-goes\html into C:\xampp\htdocs\

Then, copy a set of example configuration files from the configs folder of this repo into C:\xampp\htdocs\config. Take a look at the [config readme](docs/config.md) for more.

## Configuring Vitality GOES
Take a look at the [config readme](docs/config.md) for info on how to tweak the Vitality GOES configuration to your liking.

### Advanced configurations for goestools

"Admin Text" does not get saved by goestools due to a change in how the GOES satellites send the file down. For this text to get displayed, recompile goestools with this patch: [https://github.com/pietern/goestools/pull/105/files](https://github.com/pietern/goestools/pull/105/files). Afterwards, enable `adminPath` in `config.ini` and point it to your location for admin text files.

Vitality GOES can also show historical graphs for Viterbi error correction rates, Reed-Solomon error correction rates, packet drops, and more. To set this up, [look here](docs/graphite.md).

### Secondary Scripts

Vitality GOES comes with a number of scripts to enhance and extend its functionality. It is optional to implement any of these scripts, but some like Cleanup-EmwinText are highly encouraged.

For information on setting up these scripts, [look here](docs/scripts.md).

## Updating Vitality GOES

### Linux
Run the following commands in a terminal:

```
git clone https://github.com/JVital2013/vitality-goes
cd vitality-goes
rsync -av --exclude 'config' --exclude 'videos' html/ /var/www/html/ --delete
```

If you still have your cloned vitality-goes repo from last time, you can also just run `git pull` before running rsync.

### Windows

1. Download a zip of the most recent Vitality GOES repository ([link for the lazy](https://github.com/JVital2013/vitality-goes/archive/refs/heads/main.zip))
2. Extract the zip
3. Open a command line within the extracted zip's vitality-goes-main directory
4. Run the following command: `robocopy html C:\xampp\htdocs /MIR /R:0 /W:0 /XD videos config`

## Theming
Vitality GOES supports theming. It comes with 5 themes, but you can make your own or install others shared with you. To get started with theming, [take a look at the themes documentation](/docs/themes.md).

## Creating configs for other satellites
You can use Vitality GOES to view images from other satellites not included in the sample configs. Here's how to set it up:

* Make sure your images [are named in one of the supported naming schemas](/docs/config.ini), and are a JPG or PNG file. If your program does not save images in a supported naming schema, [open an issue/pull request to have your format supported!](https://github.com/JVital2013/vitality-goes/issues).
* In `config.ini`, disable `emwinPath`, `adminPath`, and everthing under `location` other than the timezone as these are also GOES specific. Configure at least one category ini file
* Specify the images you want to display within the category ini file(s)
* Open a pull request to have your satellite's configs included :)

## Advanced use cases
* [DataHandler API](docs/datahander-api.md)
* [Home assistant integration](docs/home-assistant.md)

## Credits
Special thanks to [Pieter Noordhuis for his amazing goestools package](https://pietern.github.io/goestools/). Without him, Vitality GOES would be nothing, and the GOES HRIT/EMWIN feed would remain out of reach for a large number of amateur satellite operators.

Also special thanks to [Aang23 for his SatDump package](https://github.com/altillimity/SatDump), the swiss army knife of amateur satellite reception.

The following software packages are included in Vitality GOES:
* **FontAwesome Free** ([https://fontawesome.com](https://fontawesome.com/)): made available under the Creative Commons License
* **LightGallery by Sachin Neravath** ([https://www.lightgalleryjs.com](https://www.lightgalleryjs.com/)): made available under the GPLv3 License.
* **Perfect DOS VGA 437 Font** ([https://www.dafont.com/perfect-dos-vga-437.font])(https://www.dafont.com/perfect-dos-vga-437.font): available in the Public Domain
* **OpenSans** ([https://fonts.google.com/specimen/Open+Sans](https://fonts.google.com/specimen/Open+Sans)): made available under the Apache License.
* **SimplerPicker** ([https://github.com/JVital2013/simplerpicker](https://github.com/JVital2013/simplerpicker)): made available under the MIT License.

## Additional Resources
Here are a few tools that may help you with picking up the HRIT/EMWIN Feed

* [USRadioGuy's SatDump Tutorial](https://usradioguy.com/receiving-goes-hrit-on-a-pi-with-satdump/): A good starting point for how to pick up geostationary weather satellites with SatDump.
* [RTL-SDR Blog tutorial on GOES reception](https://www.rtl-sdr.com/rtl-sdr-com-goes-16-17-and-gk-2a-weather-satellite-reception-comprehensive-tutorial/): A good starting point for how to pick up geostationary weather satellites with goestools.
* [USRadioGuy's goestools tutorial](https://usradioguy.com/programming-a-pi-for-goestools/): Another good tutorial to get you started with the GOES satellites
* [goesrecv-monitor](https://vksdr.com/goesrecv-monitor): Goesrecv monitor is a software utility for monitoring the status of goesrecv by Pieter Noordhuis. Provides a constellation diagram of the BPSK signal along with real-time decoding statistics.
* [goesbetween](https://github.com/JVital2013/goesbetween): Connects to goesrecv, extracts raw IQ samples from it, and sends the samples over the network via rtl_tcp. Clients like GNURadio, SDR#, SDR++, and SatDump can connect to GoesBetween to monitor the spectrum around your satellite downlink, do parallel decoding via SatDump, and more!
* [goesrecv-ps](https://github.com/JVital2013/goesrecv-ps): a collection of PowerShell scripts for monitoring goesrecv. Contains scripts to make a baseband recording of the HRIT/EMWIN signal and monitor Virtual Channel activity.

## License
2022-2024 Jamie Vital. [Made available under the GPLv3 License.](LICENSE)
