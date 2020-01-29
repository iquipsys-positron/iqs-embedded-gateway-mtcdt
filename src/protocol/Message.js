"use strict";

function Message(messageType) {
    this.type = messageType;
    this.org_id = null;
    this.gw_udi = null;
    this.device_udi = null;
    this.time = null;
}

Message.prototype.stream = function (stream) {
    this.type = stream.streamByte(this.type);
    this.org_id = stream.streamString(this.org_id);
    this.gw_udi = stream.streamString(this.gw_udi);
    this.device_udi = stream.streamString(this.device_udi);
    this.time = stream.streamDateTime(this.time);
};

Message.prototype.streamCoordinate = function (stream, value) {
    value = value * 10000000;
    value = stream.streamInteger(value);
    return value / 10000000;
};

Message.prototype.streamStrings = function (stream, values) {
    values = values || [];
    var count = stream.streamByte(values.length);
    var result = [];
    for (var index = 0; index < count; index++) {
        var item = stream.streamString(values[index]);
        result.push(item);
    }
    return result;
};

Message.prototype.streamBytes = function (stream, values) {
    values = values || [];
    var count = stream.streamByte(values.length);
    var result = [];
    for (var index = 0; index < count; index++) {
        var item = stream.streamByte(values[index]);
        result.push(item);
    }
    return result;
};

module.exports = Message;

