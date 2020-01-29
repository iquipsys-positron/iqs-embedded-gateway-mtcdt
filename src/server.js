"use strict";

var MqttConnector = require('./connectors/MqttConnector');
var DummyGatewayInfo = require('./info/DummyGatewayInfo');
var HttpGatewayInfo = require('./info/HttpGatewayInfo');
var StatisticsInfo = require('./info/StatisticsInfo');
var NullMessageRecorder = require('./info/NullMessageRecorder');
var ConsoleMessageRecorder = require('./info/ConsoleMessageRecorder');
var FileMessageRecorder = require('./info/FileMessageRecorder');

var ReadStream = require('./streams/ReadStream');
var WriteStream = require('./streams/WriteStream');
var CommStatistics = require('./protocol/CommStatistics');
var DeviceMessage = require('./protocol/DeviceMessage');
var StatisticsMessage = require('./protocol/StatisticsMessage');
var GatewayPingMessage = require('./protocol/GatewayPingMessage');
var GatewayInitMessage = require('./protocol/GatewayInitMessage');
var IncomingMessageDecoder = require('./protocol/IncomingMessageDecoder');
var CmdParser = require('./cmd/CmdParser');

var params = new CmdParser().parse();

var localBroker = params["l"] || process.env["LOCAL_MQTT_URL"] || 'mqtt://localhost:1883';
var remoteBroker = params["r"] || process.env["REMOTE_MQTT_URL"] || 'mqtt://api.positron.stage.iquipsys.net:31883';

var statsInfo = new StatisticsInfo();

var loggerType = params["t"] || process.env["LOGGER_TYPE"] || "console";

var messageLogger = loggerType == "console" ? new ConsoleMessageRecorder(false) : 
    loggerType == "file" ? new FileMessageRecorder() : new NullMessageRecorder();

var localConnector = new MqttConnector('local');
var remoteConnector = new MqttConnector('remote');

// Retrieve global info
var gatewayType = params["g"] || process.env["GATEWAY_TYPE"] || "http";
var gatewayUrl = params["u"] || process.env["GATEWAY_URL"] || "http://localhost:80";
var gatewayMac = params["m"] || process.env["GATEWAY_MAC"] || "0008004a3281";

var gatewayInfo = gatewayType == "dummy" ? new DummyGatewayInfo(gatewayMac) : new HttpGatewayInfo(gatewayUrl);

console.log("iQuipsys Gateway Server Firmware v1.2.0");
gatewayInfo.read(startProcessing)

//--------------- Start processing ----------------

function startProcessing(err) {
    if (err) {
        console.error(err);
        exit(1);
    }

    console.log('Started gateway ' + gatewayInfo.udi);

    localConnector.subscribe('lora/+/up', receiveLocalMessage);
    localConnector.connect(localBroker);

    remoteConnector.subscribe(gatewayInfo.udi + '/down', receiveRemoteMessage);
    remoteConnector.connect(remoteBroker, sendGatewayInitMessage);

    // Periodically send stats
    setInterval(sendStatsMessage, 900000);
}

//--------------- Local message processing ------------

function receiveLocalMessage(topic, buffer) {
    var eui = topic.replace("lora/", "").replace("/up", "");
    var deviceUdi = deviceEuiToUdi(eui);

    var message = new DeviceMessage();
    try {
        message.fromMessage(buffer);
        message.device_udi = deviceUdi;
    } catch (ex) {
        message = null;
    }

    if (remoteConnector.connected == false) {
        console.error("Not connected to remote client. Skipping...");
        statsInfo.updateDeviceStats(deviceUdi, 0, 1, 0, 0);
    } else if (message != null) {
        processDeviceUpMessage(message);
    } else {
        console.error("Received broken or unknown message from " + deviceUdi);
        statsInfo.updateDeviceStats(deviceUdi, 0, 1, 0, 0);
    }
}

function sendLocalMessage(message) {
    if (message.toMessage == null) return;
    if (message.device_udi == null) return;
    if (message.device_udi == '') return;

    var deviceUdi = message.device_udi;
    var eui = deviceUdiToEui(deviceUdi);
    var topic = 'lora/' + eui + '/down';
    var buffer = message.toMessage();

    localConnector.sendMessage(topic, buffer);
    statsInfo.updateDeviceStats(deviceUdi, 0, 0, 1, 0);
}

function deviceUdiToEui(udi) {
    udi = udi.replace(/[^0-9a-fA-F]/g, '');
    return udi.replace(/(..)/g, '-$1').substring(1).toLowerCase();
}

function deviceEuiToUdi(eui) {
    return eui.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
}

//--------------- Remote message processing ------------

function receiveRemoteMessage(topic, buffer) {
    var eui = topic.replace("lora/", "").replace("/up", "");
    var deviceUdi = deviceEuiToUdi(eui);
    
    var message = IncomingMessageDecoder.decode(buffer);

    if (localConnector.connected == false) {
        console.error("Not connected to local client. Skipping...");
        statsInfo.updateGatewayStats(0, 0, 0, 1);
    } else if (message != null) {
        if (message.type == 6) {
            sendPingMessage();
        } else if (message.type == 10) {
            sendStatsMessage();
        } else if (message.device_udi && message.device_udi.length > 0) {
            processDeviceDownMessage(message);
        }
    } else {
        console.error("Received broken or unknown message to " + deviceUdi);
        statsInfo.updateGatewayStats(0, 0, 0, 1);
    }
}

function sendRemoteMessage(message) {
    message.org_id = null;
    message.gw_udi = gatewayInfo.udi;
    message.time = new Date();

    var stream = new WriteStream();
    message.stream(stream);

    var buffer = stream.toBuffer();
    var topic = gatewayInfo.udi + '/up';

    remoteConnector.sendMessage(topic, buffer);
}

// -------------- Device messages ---------------

function processDeviceUpMessage(message) {
    sendRemoteMessage(message);

    statsInfo.updateDeviceStats(message.device_udi, 1, 0, 0, 0);
    messageLogger.recordOutgoingMessage(
        'Sent message from ' + message.device_udi, message);
}

function processDeviceDownMessage(message) {
    sendLocalMessage(message);
    
    statsInfo.updateDeviceStats(message.device_udi, 0, 0, 1, 0);
    messageLogger.recordIncomingMessage(
        'Received message for ' + message.device_udi, message);
}

//--------------- Gateway messages ------------

function sendGatewayInitMessage() {
    var message = new GatewayInitMessage();
    message.gw_model = gatewayInfo.model;
    message.gw_version = gatewayInfo.version;

    sendRemoteMessage(message);

    statsInfo.updateGatewayStats(1, 0, 0, 0);
    messageLogger.recordOutgoingMessage(
        'Sent gw init from ' + gatewayInfo.udi, message);
}

function sendPingMessage() {
    if (!remoteConnector.connected) return;

    var message = new GatewayPingMessage();

    sendRemoteMessage(message);

    statsInfo.updateGatewayStats(1, 0, 0, 0);
    messageLogger.recordOutgoingMessage(
        'Sent ping from ' + gatewayInfo.udi, message);
}

function sendStatsMessage() {
    if (!remoteConnector.connected) return;

    var message = new StatisticsMessage();
    message.stats = statsInfo.stats;

    sendRemoteMessage(message);

    statsInfo.updateGatewayStats(1, 0, 0, 0);
    messageLogger.recordOutgoingMessage(
        'Sent stats from ' + gatewayInfo.udi, message);
}

