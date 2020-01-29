"use strict";

function NullMessageRecorder() {
}

NullMessageRecorder.prototype.recordIncomingMessage = function(message, buffer) {
}

NullMessageRecorder.prototype.recordOutgoingMessage = function(message, buffer) {
}

module.exports = NullMessageRecorder;
