"use strict";

const ads = require('ads');
const events = require('events');
const parseSymbolName = require('./helpers').parseSymbolName;
const log = require('./helpers').log;
const config = require('../config.json');

const listenSymbols = config.listen;
const emitter = new events.EventEmitter();

const options = {
    host: process.env.ADS_TARGET_IP,
    amsNetIdTarget: process.env.ADS_TARGET_NET_ID,
    amsNetIdSource: process.env.ADS_SOURCE_NET_ID,
    amsPortTarget: 851
};
const adsClient = ads.connect(options, init);
adsClient.on('notification', receiveNotification);
adsClient.on('error', onError);

function init() {
    listenSymbols.map(subscribe.bind(this));
}

function subscribe(symbol) {
    this.notify({
        symname: symbol,
        bytelength: ads.BOOL // for now I only listen for BOOL
    });
}

function receiveNotification(handle) {
    const symbol = handle.symname;
    const value = handle.value;
    const information = parseSymbolName(symbol);
    log('ADS Event', symbol, value, parseSymbolName(symbol));
    emitter.emit('event', symbol, value, information);
}

function toggleSymbol(symbol)
{
    var myHandle = {
        symname: symbol.toString(),
        bytelength: ads.BOOL,
        propname: 'value',
        value: true
    };
    adsClient.write(myHandle, function(err, handle) {
        if(err)
            console.log('ERROR', err);
        myHandle.value = !myHandle.value;
        setTimeout(function() {
            adsClient.write(myHandle, function(err, handle) {
                if(err)
                    console.log('ERROR', err);
            });
        }, 50);
    });
}

function readSymbol(symbol, callback)
{
    var myHandle = {
        symname: symbol.toString(),
        bytelength: ads.BOOL,
        propname: 'value'
    };
    adsClient.read(myHandle, function(err, handle) {
        callback(handle.value);
    });
}

function onError(error) {
    console.log('ERROR', error);
}

function end(cb) {
    adsClient.end(function() {
        cb();
    });
}

var client = Object.create(emitter);
client.end = end;
client.toggleSymbol = toggleSymbol;
client.readSymbol = readSymbol;
module.exports = client;
