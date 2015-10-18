var express = require('express')
var ads     = require('ads');
var mqtt    = require('mqtt');
var request = require('request');
var config  = require('./config.json');

console.log(config.listen);

// Make connection with MQTT server
var mqttClient  = mqtt.connect('mqtt://192.168.1.117');
mqttClient.on('connect', function(){
    mqttClient.subscribe('hello');
});
mqttClient.on('message', function (topic, message) {
    console.log(topic, message.toString());

    if(!adsClient)
        return;

    // toggle output
    var myHandle = {
        symname: message.toString(),
        bytelength: ads.BOOL,
        propname: 'value',
        value: false
    };
    adsClient.write(myHandle, function(err, handle) {
        myHandle.value = !myHandle.value;
        adsClient.write(myHandle, function(err, handle) {
            if(err)
                console.log('ERROR', err);
        });
    });
});

// ADS
var options = {
    host: "192.168.1.199",
    amsNetIdTarget: "5.27.137.214.1.1",
    amsNetIdSource: process.env.ADS_SOURCE_IP || "192.168.1.111.1.1",
    amsPortTarget: 851
};

console.log('use ads config', options);

// Listen for ADS events
var adsClient = ads.connect(options, function() {
    for(var i=0; i < config.listen.length; i++) {
        var symbol = config.listen[i];
        this.notify({
            symname: symbol,
            bytelength: ads.BOOL,
        });
    }
    /*this.notify({
        symname: '.lLivingSalon',
        bytelength: ads.BOOL,
    });*/
});
adsClient.on('notification', function(handle){
    console.log('received: ' + handle.symname + ' => ' + handle.value);

    sendUpdate(handle.symname, handle.value);
    // fallback via API because MQTT binding is for the moment not yet
    // working in my OpenHAB config
    /*if(mqttClient) {
        mqttClient.publish('plc' + handle.symname.toLowerCase(), value.toString());
    }*/
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
function sendUpdate(name, value)
{
    value == 1 ? "ON" : "OFF"

    // clean up name
    name = name.replace('.', '');

    console.log('SEND', name, value);
    request('http://192.168.1.117:8080/CMD?LivingLight=' + value, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body) // Show the HTML for the Google homepage.
        }
    })
}

// Clean up code
process.on('SIGINT', function() {
    mqttClient.end();
    adsClient.end(function() {
        process.exit();
    });
});
