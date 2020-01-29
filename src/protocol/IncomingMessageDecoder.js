"use strict";

var GatewayPingReqMessage = require("./GatewayPingReqMessage");
var StatisticsReqMessage = require("./StatisticsReqMessage");
var DeviceMessage = require("./DeviceMessage");

var ReadStream = require("../streams/ReadStream");

function decode(buffer) {
    var messageType = buffer && buffer.length > 0 ? buffer.readUInt8(0) : -1;
    var message = null;

    switch (messageType) {
        case 2:
        case 4:
        case 8:
            message = new DeviceMessage();
            break;
        case 6:
            message = new GatewayPingReqMessage();
            break;
        case 10:
            message = new StatisticsReqMessage();
            break;
        case 12:
            message = new DeviceMessage();
            break;
    }

    if (message != null) {
        var stream = new ReadStream(buffer);

        try {
            message.stream(stream);
        } catch (ex) {
            message = null;
        }
    }

    return message;
}

module.exports = {
    decode: decode
};
