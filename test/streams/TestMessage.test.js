"use strict";

var assert = require('chai').assert;

var ReadStream = require("../../src/streams/ReadStream");
var WriteStream = require("../../src/streams/WriteStream");
var TestMessage = require("./TestMessage");

suite('TestMessage', function () {

    test('Reading and writing message', function () {
        var writeStream = new WriteStream();

        var message = new TestMessage();
        message.value1 = 1;
        message.value2 = 2;
        message.value3 = 3;
        message.value4 = -4;
        message.value5 = true;
        message.value6 = "ABC";
        message.value7 = new Date(2017, 11, 4, 11, 30, 0);
        message.value8 = new Buffer('XYZ', 'UTF-8');
        message.stream(writeStream);

        var buffer = writeStream.toBuffer();
        assert.lengthOf(buffer, 24);

        var readStream = new ReadStream(buffer);

        var message2 = new TestMessage();
        message2.stream(readStream);
        assert.equal(message.value1, message2.value1);
        assert.equal(message.value2, message2.value2);
        assert.equal(message.value3, message2.value3);
        assert.equal(message.value4, message2.value4);
        assert.equal(message.value5, message2.value5);
        assert.equal(message.value6, message2.value6);
        assert.equal(message.value7.getTime(), message2.value7.getTime());
        assert.equal(message.value8.length, message.value8.length);
        assert.equal(message.value8.toString(), message.value8.toString());
    });

});

