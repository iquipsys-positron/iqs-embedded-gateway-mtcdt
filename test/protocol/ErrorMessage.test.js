"use strict";

var assert = require('chai').assert;

var ReadStream = require("../../src/streams/ReadStream");
var WriteStream = require("../../src/streams/WriteStream");
var ErrorMessage = require("../../src/protocol/ErrorMessage");

suite('ErrorMessage', function () {

    test('Reading and writing message', function () {
        var writeStream = new WriteStream();

        var message = new ErrorMessage();
        message.org_id = '1';
        message.gw_udi = '2';
        message.device_udi = '3';
        message.time = new Date(2017, 0, 1);
        message.code = 4;
        message.message = 'Test error';
        message.stream(writeStream);

        var buffer = writeStream.toBuffer();
        assert.lengthOf(buffer, 24);

        var readStream = new ReadStream(buffer);

        var message2 = new ErrorMessage();
        message2.stream(readStream);
        assert.equal(message.type, message2.type);
        assert.equal(message.org_id, message2.org_id);
        assert.equal(message.gw_udi, message2.gw_udi);
        assert.equal(message.device_udi, message2.device_udi);
        assert.equal(message.time.getTime(), message2.time.getTime());
        assert.equal(message.code, message2.code);
        assert.equal(message.message, message2.message);
    });

});

