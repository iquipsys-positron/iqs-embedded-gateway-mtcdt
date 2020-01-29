"use strict";

//var MAX_BUFFER_SIZE = 512;
var MAX_BUFFER_SIZE = 8192;

function WriteStream(size) {
    this._pos = 0;
    size = size || MAX_BUFFER_SIZE;
    this._data = new Buffer(size);
}

WriteStream.prototype.streamByte = function (value) {
    this._data.writeUInt8(value, this._pos);
    this._pos += 1;
    return value;
};

WriteStream.prototype.streamWord = function (value) {
    this._data.writeUInt16BE(value, this._pos);
    this._pos += 2;
    return value;
};

WriteStream.prototype.streamDWord = function (value) {
    this._data.writeUInt32BE(value, this._pos);
    this._pos += 4;
    return value;
};

WriteStream.prototype.streamInteger = function (value) {
    this._data.writeInt32BE(value, this._pos);
    this._pos += 4;
    return value;
};

WriteStream.prototype.streamString = function (value) {
    value = value || '';
    var length = this._data.write(value, this._pos + 1);
    this._data.writeUInt8(length, this._pos);
    this._pos += length + 1;
    return value;
};

WriteStream.prototype.streamBoolean = function (value) {
    this.streamByte(value ? 1 : 0);
    return value;
};

WriteStream.prototype.streamDateTime = function (value) {
    var utcTimestamp = Math.floor(value.getTime() / 1000) + (value.getTimezoneOffset() * 60);
    this.streamDWord(utcTimestamp);
    return value;
};

WriteStream.prototype.streamBuffer = function (value) {
    var length = value != null ? value.length : 0;
    this._data.writeUInt8(length, this._pos);
    if (value != null)
        value.copy(this._data, this._pos + 1);
    this._pos += length + 1;
    return value;
};

WriteStream.prototype.streamReminder = function (value) {
    if (value != null) {
        value.copy(this._data, this._pos);
        this._pos += value.length;
    }
    return value;
};

WriteStream.prototype.streamNullableByte = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamByte(value) : null;
};

WriteStream.prototype.streamNullableWord = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamWord(value) : null;
};

WriteStream.prototype.streamNullableDWord = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamDWord(value) : null;
};

WriteStream.prototype.streamNullableInteger = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamInteger(value) : null;
};

WriteStream.prototype.streamNullableString = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamString(value) : null;
};

WriteStream.prototype.streamNullableBoolean = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamBoolean(value) : null;
};

WriteStream.prototype.streamNullableDateTime = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamDateTime(value) : null;
};

WriteStream.prototype.reset = function () {
    this._pos = 0;
};

WriteStream.prototype.toBuffer = function () {
    return this._data.slice(0, this._pos);
};

module.exports = WriteStream;

