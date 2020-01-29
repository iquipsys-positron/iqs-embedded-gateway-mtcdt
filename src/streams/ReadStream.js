"use strict";

function ReadStream(data) {
    this._pos = 0;
    this._data = data;
}

ReadStream.prototype.streamByte = function (value) {
    value = this._data.readUInt8(this._pos);
    this._pos += 1;
    return value;
};

ReadStream.prototype.streamWord = function (value) {
    value = this._data.readUInt16BE(this._pos);
    this._pos += 2;
    return value;
};

ReadStream.prototype.streamDWord = function (value) {
    value = this._data.readUInt32BE(this._pos);
    this._pos += 4;
    return value;
};

ReadStream.prototype.streamInteger = function (value) {
    value = this._data.readInt32BE(this._pos);
    this._pos += 4;
    return value;
};

ReadStream.prototype.streamString = function (value) {
    var length = this._data.readUInt8(this._pos);
    if (length == 0)
        value = '';
    else
        value = this._data.toString('UTF-8', this._pos + 1, this._pos + 1 + length);
    this._pos += length + 1;
    return value;
};

ReadStream.prototype.streamBoolean = function (value) {
    return this.streamByte(0) != 0;
};

ReadStream.prototype.streamDateTime = function (value) {
    var utcTimestamp = this.streamDWord(0);
    var temp = new Date();
    var ticks = (utcTimestamp - new Date().getTimezoneOffset() * 60) * 1000;
    value = new Date(ticks);
    return value;
};

ReadStream.prototype.streamBuffer = function (value) {
    var length = this._data.readUInt8(this._pos);
    value = length > 0 ? this._data.slice(this._pos + 1, this._pos + 1 + length) : null;
    this._pos += length + 1;
    return value;
};

ReadStream.prototype.streamReminder = function (value) {
    value = this._data.slice(this._pos);
    this._pos += this._data.length;
    return value;
};

ReadStream.prototype.streamNullableByte = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamByte(value) : null;
};

ReadStream.prototype.streamNullableWord = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamWord(value) : null;
};

ReadStream.prototype.streamNullableDWord = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamDWord(value) : null;
};

ReadStream.prototype.streamNullableInteger = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamInteger(value) : null;
};

ReadStream.prototype.streamNullableString = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamString(value) : null;
};

ReadStream.prototype.streamNullableBoolean = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamBoolean(value) : null;
};

ReadStream.prototype.streamNullableDateTime = function (value) {
    var notNull = this.streamBoolean(value != null);
    return notNull ? this.streamDateTime(value) : null;
};

ReadStream.prototype.reset = function () {
    this._pos = 0;
};

module.exports = ReadStream;
