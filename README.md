# ADS Proxy [![Build Status](https://travis-ci.org/Sitebase/ads-proxy.svg?branch=master)](https://travis-ci.org/Sitebase/ads-proxy)
ADS proxy will help me to control my PLC using [MQTT](http://mqtt.org/).
The main reason I need this proxy is so I can easily listen for PLC events without having to develop an ADS client for each device or programming language that I want to use it in.
MQTT is a widely know and has libraries for almost all languages and devices.

## Examples use cases
* Use OpenHAB to control you PLC symbols
* ESP8266 garden sprinkler systems that can be controlled by wall switches in the kitchen
* ESP8266 movement sensor that activates symbol in the PLC (to turn on a light for example)
* ESP8266 temperature and humidity sensor that updates symbols in the PLC
* Control my [Sonos](http://www.sonos.com/en-gb) speakers using my wall switches

## My PLC
I use this proxy in combination with a [Beckhoff CX5020](https://www.beckhoff.com/english.asp?embedded_pc/cx5010_cx5020.htm) but any other [Beckhoff PLC](http://www.beckhoff.com/) with a ethernet connection will work.

## Data flow diagram

![Diagram](diagram.png)

## How to run
I personally run this on my server using [Dokku](http://progrium.viewdocs.io/dokku/). This makes it super easy to deploy a new version.

## Configuration

1. Enable ADS on your PLC project. To do this click on your task and then enable the checkbox before `Create symbols`.
Now under I/O Devices click on Image and go to the ADS tab. Check the `Enable ADS Server` and also `Create symbols`.
Download the new configuration and make sure you reboot your PLC. The reboot is only needed when you are using TwinCat 2.

2. Now add a static route to our Beckhoff PLC. The route should point to your server that will run the proxy application.
It's also a good idea to add an extra static route that points to your local development device. This way you can test out the proxy from your development device too.

3. Add environment variables to your Dokku application.
```
dokku config:set [app name] MQTTT_SERVER=[ip of mqtt server]
dokku config:set [app name] ADS_SOURCE_NET_ID=192.168.1.116.1.1
dokku config:set [app name] ADS_TARGET_IP=192.168.1.120
dokku config:set [app name] ADS_TARGET_NET_ID=192.168.1.120.1.1
```

## Development
Add a `.env` file with following content to the repository root.
If you use autoenv this file will be sourced when going to this directory in command line.

```
# auto switch local system to the correct version of node
nvm use `node -pe "var p = require('./package.json'); (p.engines && p.engines.node || 'default').replace(/\.x/gi, '');"`

export MQTT_SERVER=192.168.1.116
export ADS_SOURCE_NET_ID=192.168.1.116.1.1
export ADS_TARGET_NET_ID=5.27.137.214.1.1
export ADS_TARGET_IP=192.168.1.126
export DEBUG=1
```

Now run `npm start` to run the project.

## Unit tests
```
npm test
```

## Debug
* View dokku logs `dokku logs [app name] -t`
* Use [MQTT.fx](http://www.jensd.de/apps/mqttfx/) to debug MQTT messages

