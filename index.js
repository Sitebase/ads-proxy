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

process.on('exit', function () {
    console.log("exit");
});

process.on('SIGINT', function() {
    client.end(function() {
        process.exit();
    });
});
