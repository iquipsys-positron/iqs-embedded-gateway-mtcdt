var mqtt = require('mqtt');

//var process = require('process');
var args = process.argv;

console.log("iQuipsys Gateway Firmware v1.2.0. Signal sender");

console.log("Connecting to mqtt broker");

var client = mqtt.connect('mqtt://localhost:1883')
var eui = args.length > 2 ? args[2] : '00-80-00-00-00-00-db-42';
var signal = args.length > 3 ? parseInt(args[3]) : 2;
var timestamp = 0;

client.on('connect', function(ask) {
    console.log('Connected to mqtt broker');

    setInterval(function() {
      var signal = 2;
      timestamp++;

      var payload = new Buffer(6);
      payload.writeUInt8(4, 0);
      payload.writeUInt8(signal, 1);
      payload.writeUInt32BE(timestamp, 2);

       var message = JSON.stringify({
         data: payload.toString('base64'),
         ask: false,
         port: 1
       });

       client.publish('lora/' + eui + '/down', message);

       console.log('Sent signal ' + signal + ' to ' + eui);
    }, 5000);

});

client.on('error', function(err) {
  console.error(err);
});

client.on('close', function() {
  console.log("Client closed");
});

client.on('reconnect', function() {
  console.log("Client reconnected");
});
