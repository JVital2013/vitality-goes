# Vitality GOES
A Web App for showcasing Geostationary Weather Satellite Data. The software is designed to display text and images received from GOES satellites via goestools or Satdump, but images from other satellites can be displayed as well

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
7. [Other Tidbits](#other-tidbits)
8. [Credits](#credits)
9. [Additional Resources](#additional-resources)

## What does Vitality GOES do?

Vitality GOES makes data received from a Geostationary Weather Satellite feed easily accessible, through a web browser, from anywhere on your local network. Even if the internet goes down, people on your local LAN can still access real-time weather information.

Vitality GOES has the following features:

* Vitality GOES is easily usable by anyone with no knowledge of radio, satellites, or programming once set up by a ground station technician (you!), 
* It presents all full-disk images, Level 2 products, and mesoscale imagery in a user friendly and easily navigatable way.
* Current weather conditions, forecasts, watches, and warnings from the GOES-16/18 HRIT/EMWIN data feed are presented to the user in a way that is appealing and easy to read. There is no need to parse through data for other locations: your configured location's data is the only thing you're shown. For a writeup on the EMWIN data Vitality GOES pulls and how it's used, see [here](docs/used-emwin-data.md).
* Vitality GOES is able to monitor the status of the underlying goestools/SatDump stack, including systems temps, error correction rates, and packet drop rates.

### How does it work?

In a typical enviornment, a satellite downlink is picked up by your satellite dish and processed into text and image data by goestools/SatDump. From there, Vitality GOES reads the data and presents it to the user on their device across the local network.

![Flow of Geostationary Weather Data Via Vitality GOES](https://user-images.githubusercontent.com/24253715/210028326-0ad63425-cb31-4489-84ea-83de3a940562.png)

## System Requirements

To get started, you need to set up a ground station with a satellite dish pointed at the satellite of your choice, and either SatDump or goestools configured to save recieved data to disk. Vitality GOES was designed to handle HRIT/EMWIN data from GOES-16/18, but other satellites may work. See the [additional resources section](#additional-resources) for info on how to set up a ground station with goestools.

It is recommended that you host Vitality GOES on your ground station itself for the most up-to-date information and to simplify setup/maintenance. If you choose, it can be hosted on another machine if you have a sync process set up between the ground station and the Vitality GOES server. *Syncing received images from another machine is outside the scope of Vitality GOES.*

It is recommended that you use a Debian-based Linux distro to host the Vitality GOES server. Something like Raspberry Pi OS, Ubuntu, or Debian is preferred.

Windows-hosted Vitality GOES runs slower than it does when hosted on Linux, and your datastore must be kept on an NTFS partition if you want weather information to load at all. It's a known issue in PHP that file operations are slower on Windows, [and they marked it as "not a bug"](https://bugs.php.net/bug.php?id=80695&edit=1).

If you enable the secondary scripts, you may need more processing power than a low-end machine like a Raspberry Pi. You may need to offload video rendering tasks to another machine or upgrade your server to something beefier. I'm using a laptop laptop with a 4th generation Core i5 processor, and it has more than enough power to run goestools, Vitality GOES, and all secondary scripts.

**The most important system requirement is the one that is most often overlooked:** you, the ground station administrator. It is expected that the ground station administrator has the ability to research, learn, and understand what computer software is actually doing. You don't need to be a Linux or Satellite expert, but you will need a working understanding of the linux filesystem, how to reconfigure conf files for goestools, and how to manipulate the Viitality GOES ini files to match your needs. Don't be afraid to reach out for help if you need it, but we appreciate it if you try to solve the problem yourself first. Support will be limited as this is a volunteer project.

Once configured, any modern web browser can connect to Vitality GOES and view the data. Anyone with access to your server can view the data with ease!

## Preparing your system for Vitality GOES

### Option 1: goestools
To assist you in configuring goestools for Vitality GOES, sample `goesrecv.conf` and `goesproc-goesr.conf` files have been included in the configs folder of this repository. These files are pretty close to "stock" suggested files. You do not need to use these exact configs. You might want to remove sections you won't be using, and you'll need do do a "Find & Replace" to update the directory to where you want your GOES products stored. In the end, your setup should be configured as follows:

* In goesproc-goesr.conf, image handlers should have the filename end in `{time:%Y%m%dT%H%M%SZ}`.
* While all EMWIN information will be in the same folder, other product types should each have their own folder for best performance. For example, Channel 2 images should be in their own folder and not co-mingled with false color images.
* If you are going to enable EMWIN information, make sure you have the emwin handler enabled in `goesproc-goesr.conf` and it's not ignoring text files.
* If you plan on tracking satellite decoding statistics, make sure your `goesrecv.conf` file has a `statsd_address` defined where you are hosting Graphite/statsd. See [See the advanced configuration section](#advanced-configurations-for-goestools) for info on how to set up Graphite/statsd. You can configure this later.

### Option 2: SatDump
TODO

### Vitality GOES Dependencies
Vitality GOES itself is a set of PHP, HTML, JavaScript, and CSS files. As such, it needs to be hosted on a web server stack. For this tutorial, I'm going to assume you're not running another web server on the same machine.

---

#### Linux
Assuming you're on a Debian/Ubuntu-based server, the following commands command should install all the dependencies you need:

```
sudo apt update
sudo apt upgrade
sudo apt install apache2 php libapache2-mod-php
```

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

### Windows
To start hosing Vitality GOES in Windows:

1. Download a zip of the Vitality GOES git repository ([link for the lazy](https://github.com/JVital2013/vitality-goes/archive/refs/heads/main.zip))
2. Extract the zip
3. Delete the contents of C:\xampp\htdocs\
4. Copy the contents of vitality-goes\html into C:\xampp\htdocs\

## Configuring Vitality GOES
Take a look at the [config readme](docs/config.md) to for initial Vitality GOES configuration.

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

## Other Tidbits

## Integrating weather data from Vitality GOES into Home Assistant
Home Assistant is a free and open-source smart home control system. You can use Vitality GOES as a "Weather Provider" in Home Assistant; [look here](docs/home-assistant.md) for more.

## Creating configs for other satellites
Vitality GOES is centered around data from the GOES-16/18 satellites, but other satellites will likely work with it. Are you interested in setting up Vitality GOES with another satellite? Here's how to do so:

* Make sure your images end with a timestamp like `{time:%Y%m%dT%H%M%SZ}`, and are a JPG or PNG file. Depending on the satellite/software, you may need to rewrite the file names after receiving them to match the expected format.
* Configure all desired images in the `abi.ini` or `meso.ini` config files (even if your sat of choice doesn't technically use an ABI).
* Delete `l2.ini` and `emwin.ini` as these are GOES Specific
* In `config.ini`, disable `emwinPath` and `adminPath` as these are also GOES specific

** I am looking for submissions of working config files for other geostationary satellites!** If you get this working, please open a pull request or otherwise contact me so I can include a sample with Vitality GOES.

## Credits
Special thanks to [Pieter Noordhuis for his amazing goestools package](https://pietern.github.io/goestools/). Without him, Vitality GOES would be nothing, and the GOES HRIT/EMWIN feed would remain out of reach for a large number of amateur satellite operators.

Also special thanks to [Aang23 for his SatDump package](https://github.com/altillimity/SatDump)

The following software packages are included in Vitality GOES:
* **FontAwesome Free** ([https://fontawesome.com](https://fontawesome.com/)): made available under the Creative Commons License
* **LightGallery by Sachin Neravath** ([https://www.lightgalleryjs.com](https://www.lightgalleryjs.com/)): made available under the GPLv3 License.
* **OpenSans** ([https://fonts.google.com/specimen/Open+Sans](https://fonts.google.com/specimen/Open+Sans)): made available under the Apache License
* **SimplerPicker** ([https://github.com/JVital2013/simplerpicker](https://github.com/JVital2013/simplerpicker)): made available under the MIT License.

## Additional Resources
Here are a few tools that may help you with picking up the HRIT/EMWIN Feed

* [RTL-SDR Blog tutorial on GOES reception](https://www.rtl-sdr.com/rtl-sdr-com-goes-16-17-and-gk-2a-weather-satellite-reception-comprehensive-tutorial/): A good starting point for how to pick up geostationary weather satellites
* [USRadioGuy's GOES tutorial](https://usradioguy.com/programming-a-pi-for-goestools/): Another good tutorial to get you started with the GOES satellites
* [goesrecv-monitor](https://vksdr.com/goesrecv-monitor): goesrecv monitor is a software utility for monitoring the status of goesrecv by Pieter Noordhuis. Provides a constellation diagram of the BPSK signal along with real-time decoding statistics
* [goesbetween](https://github.com/JVital2013/goesbetween): connects to goesrecv, extracts raw IQ samples from it, and sends the samples over the network via rtl_tcp. Clients like GNURadio, SDR#, SDR++, and SatDump can connect to GoesBetween to monitor the spectrum around your satellite downlink, do parallel decoding via SatDump, and more!
* [goesrecv-ps](https://github.com/JVital2013/goesrecv-ps): a collection of PowerShell scripts for monitoring goesrecv. Contains scripts to make a baseband recording of the HRIT/EMWIN signal and monitor Virtual Channel activity

## License
2022-2023 Jamie Vital. [Made available under the GPLv3 License.](LICENSE)
