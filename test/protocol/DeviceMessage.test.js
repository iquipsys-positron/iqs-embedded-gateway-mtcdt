"use strict";

var assert = require('chai').assert;

var ReadStream = require("../../src/streams/ReadStream");
var WriteStream = require("../../src/streams/WriteStream");
var DeviceMessage = require("../../src/protocol/DeviceMessage");

suite('DeviceMessage', function () {

    test('Reading and writing message', function () {
        var writeStream = new WriteStream();

        var message = new DeviceMessage();
        message.org_id = '1';
        message.gw_udi = '2';
        message.device_udi = '3';
        message.time = new Date(2017, 0, 1);
        message.payload = new Buffer('ABC');
        message.stream(writeStream);

        var buffer = writeStream.toBuffer();
        assert.lengthOf(buffer, 14);

        var readStream = new ReadStream(buffer);

        var message2 = new DeviceMessage();
        message2.stream(readStream);
        assert.equal(message.type, message2.type);
        assert.equal(message.org_id, message2.org_id);
        assert.equal(message.gw_udi, message2.gw_udi);
        assert.equal(message.device_udi, message2.device_udi);
        assert.equal(message.time.getTime(), message2.time.getTime());
        assert.equal(message.payload.length, message2.payload.length);
        assert.equal(message.payload.toString(), message2.payload.toString());
    });

    test('From message', function () {
        var deviceMessage = {
            device_udi: '123',
            data: new Buffer([1, 2, 3]).toString('base64')
        };
        var deviceMessageJson = JSON.stringify(deviceMessage);

        var message = new DeviceMessage();
        message.fromMessage(deviceMessageJson);

        assert.equal(1, message.type);
        assert.equal('123', message.device_udi);
        assert.equal(2, message.payload.length);
        assert.equal(2, message.payload.readUInt8(0));
        assert.equal(3, message.payload.readUInt8(1));
    });

    test('To message', function () {
        var writeStream = new WriteStream();

        var deviceMessage = {
            data: new Buffer([1, 2, 3]).toString('base64'),
            ack: false,
            port: 1
        };
        var deviceMessageJson = JSON.stringify(deviceMessage);

        var message = new DeviceMessage();
        message.type = 1;
        message.org_id = '1';
        message.gw_udi = '2';
        message.device_udi = '123';
        message.time = new Date(2017, 0, 1);
        message.payload = new Buffer([2, 3]);

        var deviceMessageJson2 = message.toMessage();

        assert.equal(deviceMessageJson, deviceMessageJson2);
    });
    
});

