"use strict";

var Message = require("./Message");

function GatewayPingReqMessage() {
    Message.call(this, 6);
}

GatewayPingReqMessage.prototype.stream = function (stream) {
    Message.prototype.stream.call(this, stream);
};

module.exports = GatewayPingReqMessage;

