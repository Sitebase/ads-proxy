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

function toggleSymbolState(client, symbol)
{
    var myHandle = {
        symname: symbol.toString(),
        bytelength: ads.BOOL,
        propname: 'value',
        value: true
    };
    client.write(myHandle, function(err, handle) {
        if(err)
            console.log('ERROR', err);
        myHandle.value = !myHandle.value;
        setTimeout(function() {
            client.write(myHandle, function(err, handle) {
                if(err)
                    console.log('ERROR', err);
            });
        }, 50);
    });
}

function readSymbolState(client, symbol, callback)
{
    var myHandle = {
        symname: symbol.toString(),
        bytelength: ads.BOOL,
        propname: 'value'
    };
    client.read(myHandle, function(err, handle) {
        console.log('value is', handle);
        callback(handle.value);
    });
}

// Clean up code
process.on('SIGINT', function() {
    mqttClient.end();
    adsClient.end(function() {
        process.exit();
    });
});
