# ADS Proxy
ADS proxy will help me to control my PLC using MQTT.
The main reason I need this is because I want to use OpenHAB in combination with my PLC (Beckhoff CX5020).
With this little proxy and can use the existing MQTT binding to do this.
Also the usage of such a well known pubsub system enables me to easily hook in sensors using ESP8266 or Arduino.

## Data flow diagram

![Diagram](diagram.jpg)

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

