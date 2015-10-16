var express = require('express')
var ads = require('ads');
var mqtt    = require('mqtt');
var app = express();
var value = 0;

// EXPRESS
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Value is: ' + value);
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

// MQTT
var client  = mqtt.connect('mqtt://192.168.1.117');

client.on('connect', function () {
    //client.subscribe('presence');
    client.publish('presence', 'Hello mqtt');
});

// ADS
var options = {
    host: "192.168.1.199",
    amsNetIdTarget: "5.27.137.214.1.1",
    amsNetIdSource: "192.168.1.111.1.1",
    //amsNetIdSource: "192.168.1.117.1.1",
    amsPortTarget: 851
};

var myHandle = {
    symname: '.lLivingSalon',
    bytelength: ads.BOOL,
};

ads = ads.connect(options, function() {
    this.notify(myHandle);
});

ads.on('notification', function(handle){
    console.log(handle.value);
    value = handle.value;
    if(client) {
        client.publish('plc' + handle.symname.toLowerCase(), value.toString());
    }
});

process.on('exit', function () {
    console.log("exit");
});

process.on('SIGINT', function() {
    ads.end(function() {
        process.exit();
    });
});
