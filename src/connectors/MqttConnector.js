"use strict";

var mqtt = require('mqtt');

function MqttConnector(name) {
    this.name = name;
    this.connected = false;
    this.listener = null;
}

MqttConnector.prototype.subscribe = function(topic, listener) {
    this.topic = topic;
    this.listener = listener;

    if (this.connected && this.client)
        this.client.subscribe(topic);
}

MqttConnector.prototype.connect = function(uri, callback) {
    this.uri = uri;

    this.client = mqtt.connect(uri)
    var self = this;

    this.client.on('connect', function(ask) { self.onConnect(ask); if (callback) callback(); });
    this.client.on('message', function(topic, message) { self.onMessage(topic, message); });
    this.client.on('error', function(err) { self.onError(err); });
    this.client.on('close', function() { self.onClose(); });
    this.client.on('reconnect', function() { self.onReconnect(); });
}

MqttConnector.prototype.disconnect = function() {
    if (this.client != null) {
        this.client.disconnect();
        this.client = null;
        this.connected = false;
    }
}

MqttConnector.prototype.onConnect = function(ask) {
    console.log('Connected MQTT client ' + this.name);
    this.connected = true;

    if (this.topic != null)
        this.client.subscribe(this.topic);
}

MqttConnector.prototype.onMessage = function(topic, buffer) {
    if (this.listener != null)
        this.listener(topic, buffer);
}

MqttConnector.prototype.onError = function(err) {
    console.err(err);
}

MqttConnector.prototype.onClose = function() {
    this.connected = false;
    console.log('MQTT client ' + this.name + ' closed');
}

MqttConnector.prototype.onReconnect = function() {
    this.connected = true;
    console.log('MQTT client ' + this.name + ' reconnected');
}

MqttConnector.prototype.sendMessage = function(topic, message) {
    if (this.client && this.connected)
        this.client.publish(topic, message, { qos: 1 });
}

module.exports = MqttConnector;
