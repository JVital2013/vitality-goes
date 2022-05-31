# Vitality GOES
A simple Progressive Web App for showcasing Geostationary Weather Satellite Data. The software is designed to showcase text and image received from GOES satellites via goestools, but other data sources may work.

### Table of Contents
1. [What does Vitality GOES do?](#what-does-vitality-goes-do)
2. [System Requirements](#system-requirements)
3. [Configuring goestools for Vitality GOES](#configuring-goestools-for-vitality-goes)
4. [Configuring Vitality GOES](#configuring-vitality-goes)
5. [Additional Script Setup](#additional-script-setup)
6. [Troubleshooting](#troubleshooting)
7. [Credits](#credits)
8. [Additional Resources](#additional-resources)

## What does Vitality GOES do?

Vitality GOES is designed to make data from the GOES HRIT/EMWIN feed easily accessible from anywhere on your local network through a web browser. Even if the internet goes down due to a weather emergency, people on your local LAN can still access real-time emergency weather information. Vitality GOES was designed with the following tenants in mind:

* Once set up by the ground station technician (you!), Vitality GOES is easily usable by anyone with no knowledge of radio, satellites, or programming
* It presents all full-disk, Level 2 products, and mesoscale imagery in a user friendly and easily navigatable way
* Pertinent EMWIN data (which includes current weather conditions, forecasts, watches, and warnings) must be presented to the user in a way that is appealing and easy to read. There is no need to parse through data for other locations: your configured location's data is the only thing you're shown.
* It is able to monitor the status of the underlying goestools stack, including systems temps, error correction rates, and packet drop rates.

### How does it work?

The following diagram shows how data flows from a GOES satellite through to Vitality GOES, and ultimately your end users:

## System Requirements

## Configuring goestools for Vitality GOES

## Configuring Vitality GOES

## Additional Script Setup

## Troubleshooting

## Credits
Special thanks to [Pieter Noordhuis for his amazing goestools package](https://pietern.github.io/goestools/). Without him Vitality GOES would be nothing, and the GOES HRIT/EMWIN feed would remain out of reach for a large number of amateur satellite operators.

The following software packages are included in Vitality GOES:
* **FontAwesome Free** ([https://fontawesome.com](https://fontawesome.com/)): made available under the Creative Commons License
* **LightGallery** ([https://www.lightgalleryjs.com](https://www.lightgalleryjs.com/)): made available under the GPLv3 License
* **OpenSans** ([https://fonts.google.com/specimen/Open+Sans](https://fonts.google.com/specimen/Open+Sans)): made abailable under the Apache License

An additional thank you to my parents, who changed my diaper for the first 2 years of my life. I'm now a father of two, so I realize how instrumental diaper changes were in me being able to create Vitality GOES (although a few events might have happened between...)

## Additional Resources
Here are a few tools that may help you with picking up the HRIT/EMWIN Feed

* [RTL-SDR Blog tutorial on GOES reception](https://www.rtl-sdr.com/rtl-sdr-com-goes-16-17-and-gk-2a-weather-satellite-reception-comprehensive-tutorial/): A good starting point for how to pick up geostationary weather satellites
* [USRadioGuy's GOES tutorial](https://usradioguy.com/programming-a-pi-for-goestools/): Another good tutorial to get you started with the GOES satellites
* [goesrecv-monitor](https://vksdr.com/goesrecv-monitor): goesrecv monitor is a software utility for monitoring the status of goesrecv by Pieter Noordhuis. Provides a constellation diagram of the BPSK signal along with real-time decoding statistics
* [goesrecv-ps](https://github.com/JVital2013/goesrecv-ps): a collection of PowerShell scripts for monitoring goesrecv. Contains scripts to monitor the spectrum goestools sees in real-time over RTL-TCP, monitor Virtual Channel activity, and more
