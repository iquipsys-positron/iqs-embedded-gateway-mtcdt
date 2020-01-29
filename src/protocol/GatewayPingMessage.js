"use strict";

var Message = require("./Message");

function GatewayPingMessage() {
    Message.call(this, 5);
}

GatewayPingMessage.prototype.stream = function (stream) {
    Message.prototype.stream.call(this, stream);
};

module.exports = GatewayPingMessage;

