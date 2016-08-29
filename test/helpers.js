const assert = require('assert'),
    helpers = require('../lib/helpers.js');


describe('Helpers',function(){

	it('parseSymbolName', function() {

        const symbol1 = 'House.blLiving02';
        const result1 = helpers.parseSymbolName(symbol1);
        assert.equal(result1.name, symbol1);
        assert.equal(result1.cleanName, 'Living');
        assert.equal(result1.list, 'House');
        assert.equal(result1.floor, 'firstfloor');
        assert.equal(result1.type, 'button-light');
        assert.strictEqual(result1.position, 2);

        const symbol2 = 'House.sMoveBathroom';
        const result2 = helpers.parseSymbolName(symbol2);
        assert.equal(result2.name, symbol2);
        assert.equal(result2.cleanName, 'MoveBathroom');
        assert.equal(result2.list, 'House');
        assert.equal(result2.floor, 'secondfloor');
        assert.equal(result2.type, 'sensor');
        assert.equal(result2.position, null);

        const symbol3 = 'House.mBathroom01Close';
        const result3 = helpers.parseSymbolName(symbol3);
        assert.equal(result3.name, symbol3);
        assert.equal(result3.cleanName, 'Bathroom01Close');
        assert.equal(result3.list, 'House');
        assert.equal(result3.floor, 'secondfloor');
        assert.equal(result3.type, 'motor');
        assert.equal(result3.position, null);
	});

	it('getMQTTTopicName', function() {
        const info = {
            name: 'House.blLiving02',
            cleanName: 'Living',
            list: 'House',
            floor: 'firstfloor',
            type: 'button-light',
            position: 2
        };
	    const topic = helpers.getMQTTTopicName(info);
        assert.equal(topic, 'home/firstfloor/button-light/living/2');
	});

});
