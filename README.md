# ADS Proxy
ADS proxy will help me to control my PLC using MQTT. The main reason I need this is because I want to use OpenHAB in combination with my PLC (Beckhoff CX5020). With this little proxy and can use the existing MQTT binding to do this.

## Data flow example

|-----|  ADS  |-------|  MQTT   |---------|
| PLC |------>| Proxy |-------->| OpenHAB |
|-----|       |-------|         |---------|

## How to run
I personally run this on my server using dokku. This makes it super easy to deploy a new version.

## Dokku config
```
dokku config:set node-js-app ADS_SOURCE_IP=192.168.1.117.1.1
```

## Debug
* View dokku logs `dokku logs node-js-app -t`
* Use [MQTT.fx](http://www.jensd.de/apps/mqttfx/) to debug MQTT messages

## Tests
Publish `hello` with value `.cToggleOfficeLight`
