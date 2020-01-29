"use strict";

function DummyGatewayInfo(udi) {
    this.udi = udi || '0008004a3286';
    this.model = 'Simulator';
    this.version = 1;
    this.serial = null;
}

DummyGatewayInfo.prototype.read = function(callback) {
    callback(null);
    return;
}

module.exports = DummyGatewayInfo;
