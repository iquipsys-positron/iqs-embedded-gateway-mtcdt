"use strict";

var fs = require('fs');

function FileMessageRecorder(incomingFile, outgoingFile) {
    this.incomingFile = incomingFile || "/media/card/incoming.dat";
    this.outgoingFile = outgoingFile || "/media/card/outgoing.dat";
}

FileMessageRecorder.prototype.saveMessage = function(file, message) {
    if (message.device_udi && message.payload) {
        var udi = message.device_udi;
        var time = new Date(message.time).toISOString();
        var data = '' + message.payload;
        var line = device_udi + ',' + time + ',' + data + '\n';
        fs.appendFile(file, line);
    }
}

FileMessageRecorder.prototype.recordIncomingMessage = function(message, buffer) {
    this.saveMessage(this.incomingFile, buffer);
}

FileMessageRecorder.prototype.recordOutgoingMessage = function(message, buffer) {
    this.saveMessage(this.outgoingFile, buffer);
}

module.exports = FileMessageRecorder;
