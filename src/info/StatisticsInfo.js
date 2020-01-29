"use strict";

var CommStatistics = require('../protocol/CommStatistics');

function StatisticsInfo(udi) {
    this.stats = [];
}

StatisticsInfo.prototype.clear = function() {
    this.stats = [];
}

StatisticsInfo.prototype.updateDeviceStats = function(deviceUdi, upPackets, upErrors, downPackets, downErrors) {
    var stat = null;
    var now = new Date();

    for (var i = 0; i < this.stats.length; i++) {
        if (this.stats[i].device_udi == deviceUdi) {
            stat = this.stats[i];
            break;
        }
    }

    if (stat == null) {
        stat = new CommStatistics();
        stat.device_udi = deviceUdi;
        stat.init_time = now;
        this.stats.push(stat);
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

StatisticsInfo.prototype.updateGatewayStats = function(upPackets, upErrors, downPackets, downErrors) {
    this.updateDeviceStats(null, upPackets, upErrors, downPackets, downErrors);
}

module.exports = StatisticsInfo;
