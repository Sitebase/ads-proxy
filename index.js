var ads = require('ads');
var express = require('express')

var app = express();
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.get('/', function(request, response) {
    response.send('useless page to run this on dokku :)');
});
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});


var options = {
    host: "192.168.1.126",
    amsNetIdTarget: "5.27.137.214.1.1",
    amsNetIdSource: "192.168.1.116.1.1",
    amsPortTarget: 851
};

var myHandle = {
    // symname: '.lLivingSalon',
    symname: 'House.lKitchenSink',
    bytelength: ads.BOOL,

    //OPTIONAL: (These are set by default)
    //transmissionMode: ads.NOTIFY.ONCHANGE, (other option is ads.NOTIFY.CYLCIC)
    //maxDelay: 0,  -> Latest time (in ms) after which the event has finished
    //cycleTime: 10 -> Time (in ms) after which the PLC server checks whether the variable has changed
};

client = ads.connect(options, function() {
    this.notify(myHandle);
});

client.on('notification', function(handle){
    console.log(handle.value);
});

process.on('exit', function () {
    console.log("exit");
});

process.on('SIGINT', function() {
    client.end(function() {
        process.exit();
    });
});
