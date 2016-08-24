var express = require('express')
var ads     = require('ads');
var mqtt    = require('mqtt');
var request = require('request');
var config  = require('./config.json');

console.log(config.listen);

// Make connection with MQTT server
var mqttClient  = mqtt.connect('mqtt://192.168.1.116');
mqttClient.on('connect', function(){
    mqttClient.subscribe('hello');
    mqttClient.publish('/test', 'test from dokku');
});
mqttClient.on('message', function (topic, message) {

    var data = JSON.parse(message);

    console.log(topic, data);

    if(!adsClient)
        return;

    // if the action is toggle, we don't care about the current state
    if(data.action.toLowerCase() === 'toggle' || data.stateSymbol === '') {
        toggleSymbolState(adsClient, data.symbol);
    } else {
        readSymbolState(adsClient, data.stateSymbol, function(value) {
            console.log('READ', data.action.toLowerCase(), value);
            if(
                (data.action.toLowerCase() === 'on' && value == '0') ||
                (data.action.toLowerCase() === 'off' && value == '1')
            ) {
                console.log('trigger toggle');
                toggleSymbolState(adsClient, data.symbol);
            }
        });
    }
});

// ADS
var options = {
    host: "192.168.1.126",
    amsNetIdTarget: "5.27.137.214.1.1",
    amsNetIdSource: process.env.ADS_SOURCE_IP || "192.168.1.116.1.1",
    amsPortTarget: 851
};

// Listen for ADS events
var adsClient = ads.connect(options, function() {
    for(var i=0; i < config.listen.length; i++) {
        var symbol = config.listen[i];
        this.notify({
            symname: symbol,
            bytelength: ads.BOOL,
        });
    }
});
var state = {};
adsClient.on('notification', function(handle){
    console.log('received: ' + handle.symname + ' => ' + handle.value);
    // sendUpdate(handle.symname, handle.value);
    // state[handle.symname] = handle.value;
    // fallback via API because MQTT binding is for the moment not yet
    // working in my OpenHAB config
    if(mqttClient) {
        mqttClient.publish('/plc/' + handle.symname.toLowerCase(), value.toString());
    }
});

// Express page
var app = express();
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.get('/', function(request, response) {
    response.send('useless page to run this on dokku :)');
});
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});

// OpenHAB switch update using API
// curl -s "http://server.lan:8080/CMD?LivingLight=ON"
// curl -s "http://server.lan:8080/rest/items/kLivingCirkelLichtReserveKnop3?type=json"
// for the moment all buttons are seens as toggles
// I thing we can make this auto detectable if we fetch openhab items and see what type the specific symbol has
// if it's a switch - it's a toggle button
function sendUpdate(name, value)
{

    console.log('send update', name, value);
    return;
    // for toggles we can ignore all off values
    if(value == 0)
        return;

    value = value == 1 ? "ON" : "OFF"

    // clean up name
    name = name.replace('.', '');

    console.log('SEND', name, value);
    request('http://192.168.1.117:8080/rest/items/' + name + '?type=json', function (error, response, body) {

        if(error || response.statusCode !== 200) {
            console.log('fetch state failed');
            return;
        }

        // do a toggle
        var data = JSON.parse(body);
        var currentState = data.state;
        if(currentState === 'ON' && value === 'ON')
            value = 'OFF';

        console.log('current', currentState, value);

        request('http://192.168.1.117:8080/CMD?' + name + '=' + value, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body) // Show the HTML for the Google homepage.
            }
        })
    });
}

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
