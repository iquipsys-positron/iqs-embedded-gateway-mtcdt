var mqtt = require('mqtt');
var gw = require('./gateway');
var fs = require('fs');

var ReadStream = require('./streams/ReadStream');
var WriteStream = require('./streams/WriteStream');
var CommStatistics = require('./protocol/CommStatistics');
var DeviceMessage = require('./protocol/DeviceMessage');
var StatisticsMessage = require('./protocol/StatisticsMessage');
var GatewayPingMessage = require('./protocol/GatewayPingMessage');
var GatewayInitMessage = require('./protocol/GatewayInitMessage');
var IncomingMessageDecoder = require('./protocol/IncomingMessageDecoder');

//var localBroker = 'mqtt://localhost:1883';
var localBroker = 'mqtt://192.168.0.105:1883';
//var remoteBroker = 'mqtt://tracker.pipservices.net:1883';
//var remoteBroker = 'mqtt://positron-svc.iquipsys.net:1883';
var remoteBroker = 'mqtt://localhost:1883';

var saveToFile = false;
var incomingFile = "/media/card/incoming.dat";
var outgoingFile = "/media/card/outgoing.dat";

var gatewayModel = null;
var gatewayVersion = 1;
var gatewayUdi = '0008004a3286';

var stats = [];
var lastStatsSent = 0;

console.log("iQuipsys Gateway Server Firmware v1.2.0");

// Retrieve global info
gw.getGatewayInfo(function(err, info) {
    if (err) {
        console.error(err);
        exit(1);
    }

    console.log(info);
    gatewayModel = info.gw_model;
    gatewayUdi = info.gw_udi;

    console.log('Started gateway ' + info.gw_udi);

    if (remoteClient != null && remoteConnected) {
        remoteClient.subscribe(gatewayUdi + '/down');
        sendGatewayInitMessage();
    }
});

// Connect to local client
var localConnected = false;
var localClient = mqtt.connect(localBroker)
localClient.on('connect', onLocalClientConnect);
localClient.on('message', onLocalClientMessage);
localClient.on('error', onClientError);
localClient.on('close', onLocalClientClose);
localClient.on('reconnect', onLocalClientReconnect);

// Connect to remote client
var remoteConnected = false;
var remoteClient = mqtt.connect(remoteBroker)
remoteClient.on('connect', onRemoteClientConnect);
remoteClient.on('message', onRemoteClientMessage);
remoteClient.on('error', onClientError);
remoteClient.on('close', onRemoteClientClose);
remoteClient.on('reconnect', onRemoteClientReconnect);

// Periodically send stats
setInterval(sendStatsMessage, 900000);

//--------------- File processing ----------------

function saveMessage(file, device_udi, message) {
    if (!saveToFile) return;

    var time = new Date(message.time).toISOString();
    var data = (message.payload || '');
    var line = device_udi + ',' + time + ',' + data + '\n';
    fs.appendFile(file, line);
}

//--------------- Local client processing ------------

function onLocalClientConnect(ask) {
    console.log('Connected to local MQTT broker');
    localConnected = true;
    localClient.subscribe('lora/+/up');
}

function onLocalClientMessage(topic, buffer) {
    var eui = topic.replace("lora/", "").replace("/up", "");
    var deviceUdi = deviceEuiToUdi(eui);

    var message = new DeviceMessage();
    try {
        message.fromMessage(buffer);
        message.device_udi = deviceUdi;
    } catch (ex) {
        message = null;
    }

    if (remoteConnected == false) {
        console.error("Not connected to remote client. Skipping...");
        updateDeviceStats(deviceUdi, 0, 1, 0, 0);
    } else if (message != null) {
        processDeviceUpMessage(message);
    } else {
        console.error("Received broken or unknown message from " + deviceUdi);
        updateDeviceStats(deviceUdi, 0, 1, 0, 0);
    }
}

function onClientError(err) {
  console.err(err);
}

function onLocalClientClose() {
    localConnected = false;
    console.log("Local client closed");
}

function onLocalClientReconnect() {
    localConnected = true;
    console.log("Local client reconnected");
}

function sendLocalMessage(message) {
    if (message.toMessage == null) return;
    if (message.device_udi == null) return;
    if (message.device_udi == '') return;

    var deviceUdi = message.device_udi;
    var eui = deviceUdiToEui(deviceUdi);
    var topic = 'lora/' + eui + '/down';
    var buffer = message.toMessage();

    localClient.publish(topic, buffer);
    updateDeviceStats(deviceUdi, 0, 0, 1, 0);
    
    console.log('Sent msg down to ' + deviceUdi);
    console.log(message);
}

//--------------- remote client processing ------------

function onRemoteClientConnect(ask) {
    console.log('Connected to remote MQTT broker');

    remoteConnected = true;

    if (gatewayUdi != null) {
        remoteClient.subscribe(gatewayUdi + '/down');
        sendGatewayInitMessage();
    }
}

function onRemoteClientMessage(topic, buffer) {
    var message = IncomingMessageDecoder.decode(buffer);

    if (localConnected == false) {
        console.error("Not connected to local client. Skipping...");
        updateGatewayStats(0, 0, 0, 1);
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
        updateGatewayStats(0, 0, 0, 1);
    }
}

function sendRemoteMessage(message) {
    message.org_id = null;
    message.gw_udi = gatewayUdi;
    message.time = new Date();

    var stream = new WriteStream();
    message.stream(stream);

    var buffer = stream.toBuffer();
    var topic = gatewayUdi + '/up';

     remoteClient.publish(topic, buffer);
}

function onRemoteClientClose() {
    remoteConnected = false;
    console.log("Remote client closed");
}

function onRemoteClientReconnect() {
    remoteConnected = true;
    console.log("Remote client reconnected");
}

// -------------- Device messages ---------------

function processDeviceUpMessage(message) {
    var deviceUdi = message.device_udi;
    sendRemoteMessage(message);

    updateDeviceStats(deviceUdi, 1, 0, 0, 0);
    saveMessage(outgoingFile, deviceUdi, message);

    console.log('Sent msg up from ' + deviceUdi);
    console.log(message);
}

function processDeviceDownMessage(message) {
    var deviceUdi = message.device_udi;
    sendLocalMessage(message);
    
    updateDeviceStats(deviceUdi, 0, 0, 1, 0);
    saveMessage(incomingFile, deviceUdi, message);
    
    console.log('Sent msg down to ' + deviceUdi);
    console.log(message);
}

//--------------- Communication stats ------------

function updateDeviceStats(deviceUdi, upPackets, upErrors, downPackets, downErrors) {
    var stat = null;
    var now = new Date();

    for (var i = 0; i < stats.length; i++) {
        if (stats[i].device_udi == deviceUdi) {
            stat = stats[i];
            break;
        }
    }

    if (stat == null) {
        stat = new CommStatistics();
        stat.device_udi = deviceUdi;
        stat.init_time = now;
        stats.push(stat);
    }

    if (upPackets != null || upErrors != null) {
        stat.up_time = now;
        stat.up_packets += upPackets || 0;
        stat.up_errors += upErrors || 0;
    }

    if (downPackets != null || downErrors != null) {
        stat.down_time = now;
        stat.down_packets += downPackets || 0;
        stat.down_errors += downErrors || 0;
    }
}

function updateGatewayStats(upPackets, upErrors, downPackets, downErrors) {
    updateDeviceStats(null, upPackets, upErrors, downPackets, downErrors);
}

//--------------- Gateway messages ------------

function sendGatewayInitMessage() {
    var message = new GatewayInitMessage();
    message.gw_model = gatewayModel;
    message.gw_version = gatewayVersion;

    sendRemoteMessage(message);
    updateGatewayStats(1, 0, 0, 0);
    
    console.log('Sent gw init from ' + gatewayUdi);
    console.log(message);
}

function sendPingMessage() {
    if (!remoteConnected) return;

    var message = new GatewayPingMessage();

    sendRemoteMessage(message);
    updateGatewayStats(1, 0, 0, 0);
    
    console.log('Sent ping from ' + gatewayUdi);
    console.log(message);
}

function sendStatsMessage() {
    if (!remoteConnected) return;
    lastStatsSent = new Date();

    var message = new StatisticsMessage();
    message.stats = stats;

    sendRemoteMessage(message);
    updateGatewayStats(1, 0, 0, 0);
    
    console.log('Sent stats from ' + gatewayUdi);
    console.log(message);
}

//--------------- Utility functions ------------

function deviceUdiToEui(udi) {
    udi = udi.replace(/[^0-9a-fA-F]/g, '');
    return udi.replace(/(..)/g, '-$1').substring(1).toLowerCase();
}

function deviceEuiToUdi(eui) {
    return eui.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
}

