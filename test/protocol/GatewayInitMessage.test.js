"use strict";

var assert = require('chai').assert;

var ReadStream = require("../../src/streams/ReadStream");
var WriteStream = require("../../src/streams/WriteStream");
var GatewayInitMessage = require("../../src/protocol/GatewayInitMessage");

suite('GatewayInitMessage', function () {

    test('Reading and writing message', function () {
        var writeStream = new WriteStream();

        var message = new GatewayInitMessage();
        message.org_id = '1';
        message.gw_udi = '2';
        message.device_udi = '3';
        message.time = new Date(2017, 0, 1);
        message.gw_version = 4;
        message.gw_model = 'XYZ';
        message.stream(writeStream);

        var buffer = writeStream.toBuffer();
        assert.lengthOf(buffer, 16);

        var readStream = new ReadStream(buffer);

        var message2 = new GatewayInitMessage();
        message2.stream(readStream);
        assert.equal(message.type, message2.type);
        assert.equal(message.org_id, message2.org_id);
        assert.equal(message.gw_udi, message2.gw_udi);
        assert.equal(message.device_udi, message2.device_udi);
        assert.equal(message.time.getTime(), message2.time.getTime());
        assert.equal(message.gw_version, message2.gw_version);
        assert.equal(message.gw_model, message2.gw_model);
    });

});

