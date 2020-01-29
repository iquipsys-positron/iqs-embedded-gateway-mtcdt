var mqtt = require('mqtt');

//var process = require('process');
var args = process.argv;

console.log("iQuipsys Gateway Firmware v1.2.0. Packet sniffer");

console.log("Connecting to mqtt broker");

var serverUrl = args.length > 2 ? args[2] : 'mqtt://localhost:1883';
var client = mqtt.connect(serverUrl)

client.on('connect', function(ask) {
    console.log('Connected to mqtt broker');

    if (args.length > 3) {
      for (var index = 3; index < args.length; index++)
        client.subscribe(args[index]);
    } else {
      client.subscribe('#');
    }
});

client.on('error', function(err) {
  console.error(err);
});

client.on('message', function(topic, message) {
  console.log("topic: " + topic);
  var msg = JSON.parse(message.toString());
  console.log(msg);
});

client.on('close', function() {
  console.log("Client closed");
});

client.on('reconnect', function() {
  console.log("Client reconnected");
});
