"use strict";

var http = require('http');

function HttpGatewayInfo(uri) {
    this.uri = uri;
    this.udi = null;
    this.model = null;
    this.version = 1;
    this.serial = null;
}

HttpGatewayInfo.prototype.read = function(callback) {
    var self = this;

    var route = this.uri + '/api/system';

    return http.get(
        route, 
        function(response) {
            // Continuously update stream with data
            var body = '';
            
            response.on('data', function(d) {
                body += d;
            });

            response.on('error', function(err) {
                if (callback) callback(err);
            });

            response.on('end', function() {
                // Data reception is done, do whatever with it!
                var msg = JSON.parse(body).result || {};

                self.udi = msg.macAddress
                    ? msg.macAddress.replace(/[\W-:]/g, '').toLowerCase() : null;
                self.model = msg.productId;
                self.serial = msg.deviceId;

                if (callback) callback(null);
            });
        }
    );
}

module.exports = HttpGatewayInfo;
