"use strict";

var Message = require("./Message");

function GatewayInitMessage() {
    Message.call(this, 0);

    this.gw_model = null;
    this.gw_version = null;
}

GatewayInitMessage.prototype.stream = function (stream) {
    Message.prototype.stream.call(this, stream);

    this.gw_model = stream.streamString(this.gw_model);
    this.gw_version = stream.streamByte(this.gw_version);
};

module.exports = GatewayInitMessage;

