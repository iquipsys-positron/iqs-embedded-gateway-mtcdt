"use strict";

function DeviceMessage() {
    this.type = 0;
    this.org_id = null;
    this.gw_udi = null;
    this.device_udi = null;
    this.time = new Date();
    this.payload = null;
}

DeviceMessage.prototype.stream = function (stream) {
    this.type = stream.streamByte(this.type);
    this.org_id = stream.streamString(this.org_id);
    this.gw_udi = stream.streamString(this.gw_udi);
    this.device_udi = stream.streamString(this.device_udi);
    this.time = stream.streamDateTime(this.time);
    this.payload = stream.streamReminder(this.payload);
};

DeviceMessage.prototype.toMessage = function() {
    var data = new Buffer(this.payload ? this.payload.length + 1 : 1);
    data.writeUInt8(this.type, 0);
    if (this.payload)
        this.payload.copy(data, 1);

    var message = {
        data: data.toString('base64'),
        ack: false,
        port: 1
    };

    return JSON.stringify(message);
}

DeviceMessage.prototype.fromMessage = function(value) {
    var message = JSON.parse(value.toString());
    var data = new Buffer(message.data, 'base64');

    //this.device_udi = message.device_udi;
    this.type = data.length > 0 ? data.readUInt8(0) : 0;
    this.payload = data.length > 1 ? data.slice(1) : null;
}

module.exports = DeviceMessage;

