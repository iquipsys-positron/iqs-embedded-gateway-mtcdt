function TestMessage() {}

TestMessage.prototype.stream = function (stream) {
    this.value1 = stream.streamByte(this.value1);
    this.value2 = stream.streamWord(this.value2);
    this.value3 = stream.streamDWord(this.value3);
    this.value4 = stream.streamInteger(this.value4);
    this.value5 = stream.streamBoolean(this.value5);
    this.value6 = stream.streamString(this.value6);
    this.value7 = stream.streamDateTime(this.value7);
    this.value8 = stream.streamBuffer(this.value8);
};

module.exports = TestMessage;

