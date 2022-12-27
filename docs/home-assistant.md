# Using Vitality GOES as a Home Assistant Weather Provider

Home Assistant ([https://www.home-assistant.io/](https://www.home-assistant.io/)) is a free and open-source smart home control system. It has a focus on "local" device control, data collection, and home automation - all without making your smart home dependent on the "cloud" (aka someone else's computer).

I use Home Assistant and other open-source projects, like Tasmota ([https://tasmota.github.io/docs/](https://tasmota.github.io/docs/)), to connect my lights, fans, temp/humidity sensors, and other "smart" devices into one cohesive ecosystem. It's very stable and integrates well with other services like Apple HomeKit, Google Assistant, and Alexa.

### What does this have to do with Weather Satellites?

One feature of Home Assistant is the ability to integrate weather data from a "Weather Provider." You can then display weather info in the Home Assistant dashboard, or use it to control smarthome automations. Some weather-related automation examples would include:

- Turn on the dehumidifier when it starts raining
- Close the blinds in a particular room when the sun comes out
- Make all your smarthome speakers play "Africa" by Toto every time the rain pours down
- And so on

The default Weather Provider is [Meteorologisk institutt (Met.no)](https://www.home-assistant.io/integrations/met/), which is a cloud service provided by the Norwegian Meteorological Institute and the NRK. This is suboptimal, because:

1. I'm not in Norway, and
2. It relies on the cloud

To fix this problem, we can use Vitality GOES as the weather provider in Home Assistant. This removes Home Assistant's reliance on the cloud for its weather information - instead, it will use satellites. Satellites are above the clouds, which make them inherently better.

  ![Vitality GOES in Home Assistant](https://user-images.githubusercontent.com/24253715/208737251-46283413-303b-4406-a2eb-3fadef680867.png)

## System Requirements

To set this up, the following items should already be configured:

1. **Vitality GOES:** The "Current Weather" screen must load successfully, and the "Current Weather" and "7-day Forecast" cards must work. If either are missing, verify your config.ini.
2. **Home Assistant:** To get started with it, see [https://www.home-assistant.io/getting-started/](https://www.home-assistant.io/getting-started/).

Vitality GOES and Home Assistant can (and probably should) be on different machines, as long as they can talk to each other across the network.

## Configuring Home Assistant

Nothing will need to be changed about Vitality GOES as long as its Current Weather screen already shows the necessary items.

In Home Assistant, [edit your configuration.yaml file](https://www.home-assistant.io/docs/configuration/) to include the configuration information found in [configs/homeassistant-configuration.yaml](/configs/homeassistant-configuration.yaml) of this repo.

If you don't already have a `rest:` or `weather:` section in your configuration.yaml (you probably won't), you can just copy and paste my example into your config file, save it, and restart Home Assistant. Don't forget to set the IP/hostname and port of your Vitality GOES instance where notated!

If you're a Home Assistant Pro and already have one or both of these sections, work the example config in as necessary.

## How it works

The `rest:` configuration pulls pertinent weather data from Vitality GOES via the dataHandler API.  The data values are loaded into a multitude of Home Assistant "Sensor" entities. Then, the `weather:` configuration assembles all the sensors into one cohesive "Weather" entity.

  ![Example Vitality GOES Entities](https://user-images.githubusercontent.com/24253715/208742817-9a2386e5-cc94-4b31-99a0-f3d48bb16807.png)

I have opted to "hide" all the forecast sensors in my setup since they have obtuse JSON data in them, but I'm keeping the current condition sensors enabled. This enables me to track conditions like temp, humidity, etc over time.

![Tracking Wind Over Time](https://user-images.githubusercontent.com/24253715/208743076-08b4ec9c-b493-4583-9988-ab7b39428151.png)
