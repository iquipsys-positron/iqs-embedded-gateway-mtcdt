"use strict";

var Message = require("./Message");

function StatisticsReqMessage() {
    Message.call(this, 10);
}

StatisticsReqMessage.prototype.stream = function (stream) {
    Message.prototype.stream.call(this, stream);
};

module.exports = StatisticsReqMessage;

