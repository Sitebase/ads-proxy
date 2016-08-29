'use strict';

const mqtt = require('mqtt');
const events = require('events');
const log = require('./helpers').log;

const emitter = new events.EventEmitter();
const server = process.env.MQTT_SERVER;
const mqttClient  = mqtt.connect('mqtt://' + server);

mqttClient.on('connect', onConnected);
mqttClient.on('error', onError);
mqttClient.on('message', onMessage);

function onConnected() {
    log('connected to MQTT server');
}

function onError(error) {
    console.log('ERROR', error)
}

function onMessage(topic, message) {
    console.log('message', topic, message);

    // are we interested in this
    if(topic.substr(0, 15) !== 'home/ads-proxy/')
        return;

    // var data = JSON.parse(message);

    // console.log(topic, data);

    // if(!adsClient)
        // return;

    // if(data.action.toLowerCase() === 'toggle' || data.stateSymbol === '') {
        // toggleSymbolState(adsClient, data.symbol);
    // } else {
        // readSymbolState(adsClient, data.stateSymbol, function(value) {
            // console.log('READ', data.action.toLowerCase(), value);
            // if(
                // (data.action.toLowerCase() === 'on' && value == '0') ||
                // (data.action.toLowerCase() === 'off' && value == '1')
            // ) {
                // console.log('trigger toggle');
                // toggleSymbolState(adsClient, data.symbol);
            // }
        // });
    // }
}

function publish(topic, data) {
    if(!mqttClient)
        return console.log('ERROR', 'failed to publish', topic);

    if(typeof data === 'object')
        data = JSON.stringify(data);

    // console.log('publish mqtt event');
    mqttClient.publish(topic, data);
}

function end() {
    mqttClient.end();
}

var client = Object.create(emitter);
client.end = end;
client.publish = publish;
module.exports = client;
