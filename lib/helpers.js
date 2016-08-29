"use strict";

/**
 * Extract information from the symbol name
 * based on my own symbol naming convention
 *
 * https://regex101.com/r/iN4oF2/1
 */
const PARSE_SYMBOL = /([a-zA-Z]*)?.([lbsmop]{1,2})([a-zA-Z]*)([0-9]{1,3})?(Open|Close)?/;
const SYMBOL_TYPES = {
    s: 'sensor',
    b: 'button',
    bl: 'button-light',
    l: 'light',
    m: 'motor',
    o: 'outlet',
    p: 'pump'
}
function parseSymbolName(name) {
    const result = name.match(PARSE_SYMBOL);
    const list = result[1];
    const type = SYMBOL_TYPES[result[2]] || 'unkown';
    const cleanName = result[3];
    const position = result[4] ? parseInt(result[4], 10) : null;
    const movement = result[5] ? result[5] : null;

    // floor detection
    let floor = 'firstfloor';
    if(name.match(/cellar/i))
       floor = 'basement';
    if(name.match(/roomone|roomtwo|roomthree|bathroom/i))
        floor = 'secondfloor';
    if(name.match(/attic/i))
        floor = 'thirdfloor';

    return {
        name,
        cleanName,
        list,
        floor,
        type,
        position,
        movement
    };
}

function log() {
    if(process.env.DEBUG)
        console.log(...arguments);
}

function getMQTTTopicName(info) {
    const topicParts = [
        'home',
        info.floor,
        info.type,
        info.cleanName.toLowerCase()
    ];

    if(info.position)
        topicParts.push(info.position);

    if(info.movement)
        topicParts.push(info.movement);

    return topicParts.join('/');
}

module.exports = {
    parseSymbolName: parseSymbolName,
    log: log,
    getMQTTTopicName: getMQTTTopicName
};
