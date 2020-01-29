"use strict";

function ConsoleMessageRecorder(full) {
    this.full = full;
}

ConsoleMessageRecorder.prototype.recordIncomingMessage = function(message, buffer) {
    console.log(message);
    if (this.full) console.log(buffer);
}

ConsoleMessageRecorder.prototype.recordOutgoingMessage = function(message, buffer) {
    console.log(message);
    if (this.full) console.log(buffer);
}

module.exports = ConsoleMessageRecorder;
