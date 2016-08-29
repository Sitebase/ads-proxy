"use strict";

const express = require('express')
const request = require('request');
const info = require('./package.json');
const adsClient = require('./lib/ads');
const mqttClient = require('./lib/mqtt');
const getMQTTTopicName = require('./lib/helpers').getMQTTTopicName;
const parseSymbolName = require('./helpers').parseSymbolName;

/************************************************************
 * REST API
 ***********************************************************/

var app = express();
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.get('/', function(request, response) {
    response.status(200).send({
        name: info.name,
        version: info.version
    });
});

// this should be a PUT, but for testing keep it GET for now
app.get('/symbols/:symbol/go', function(request, response) {
    const action = request.query.action || 'toggle';
    const symbol = request.params.symbol;
    console.log('toggle', symbol, action);
    adsClient.toggleSymbol(symbol);
    response.send({status: 'ok'});
});

app.get('/symbols/:symbol', function(request, response) {
    const symbol = request.params.symbol;
    const information = parseSymbolName(symbol)

    adsClient.readSymbol(symbol, function(value) {
        response.send({
            status: 'ok',
            symbol: symbol,
            information: information ,
            value: value
        });
    });
});

app.listen(app.get('port'), function() {
    console.log('ADS proxy running on port ' + app.get('port'));
});

/************************************************************
 * PROXY
 ***********************************************************/

adsClient.on('event', function(symbol, value, information) {
    const topic = getMQTTTopicName(information);

    information.symbol = symbol;
    information.value = value;
    mqttClient.publish(topic, information);
});

process.on('SIGINT', function() {
    mqttClient.end();
    adsClient.end(function() {
        process.exit();
    });
});
