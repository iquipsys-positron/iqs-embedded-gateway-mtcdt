var http = require('http');

function getSystemInfo(callback) {
    return http.get(
        {
            host: 'localhost',
            path: '/api/system'
        }, 
        function(response) {
            // Continuously update stream with data
            var body = '';
            
            response.on('data', function(d) {
                body += d;
            });

            response.on('error', function(err) {
                callback(err);
            });

            response.on('end', function() {
                // Data reception is done, do whatever with it!
                var msg = JSON.parse(body);
                callback(null, msg.result);
            });
        }
    );
}

function getGatewayInfo(callback) {
    getSystemInfo(function(err, msg) {
        if (err != null || msg == null) {
            callback(err);
            return;
        }

        var macAddress = msg.macAddress ? msg.macAddress.replace(/[\W-:]/g, '').toLowerCase() : null;

        callback(null, {
            gw_model: msg.productId,
            gw_serial: msg.deviceId,
            gw_udi: macAddress
        });
    });
}

module.exports = {
    getSystemInfo: getSystemInfo,
    getGatewayInfo: getGatewayInfo
}
