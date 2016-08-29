"use strict";

const express = require('express')
const request = require('request');
const adsClient = require('./lib/ads');
const mqttClient = require('./lib/mqtt');
const getMQTTTopicName = require('./lib/helpers').getMQTTTopicName;

adsClient.on('event', function(symbol, value, information) {
    const topic = getMQTTTopicName(information);

    information.symbol = symbol;
    information.value = value;
    mqttClient.publish(topic, information);
});


// Listen for ADS events
var state = {};

// Express page
var app = express();
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.get('/', function(request, response) {
    adsClient.toggleSymbol('House.sbKitchen03');
    response.send('useless page to run this on dokku :)');
});
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});

process.on('SIGINT', function() {
    mqttClient.end();
    adsClient.end(function() {
        process.exit();
    });
});
