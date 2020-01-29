"use strict";

var Message = require("./Message");

function ErrorMessage() {
    Message.call(this, 11);

    this.code = null;
    this.message = null;
}

ErrorMessage.prototype.stream = function (stream) {
    Message.prototype.stream.call(this, stream);

    this.code = stream.streamWord(this.code);
    this.message = stream.streamString(this.message);
};

module.exports = ErrorMessage;

