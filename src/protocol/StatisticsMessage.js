"use strict";

var Message = require("./Message");
var CommStatistics = require("./CommStatistics");

function StatisticsMessage() {
    Message.call(this, 9);
    this.stats = [];
}

StatisticsMessage.prototype.stream = function (stream) {
    Message.prototype.stream.call(this, stream);
    this.stats = StatisticsMessage.prototype.streamStats(stream, this.stats);
};

StatisticsMessage.prototype.streamStats = function (stream, stats) {
    stats = stats || [];
    var count = stream.streamWord(stats.length);
    var result = [];
    for (var index = 0; index < count; index++) {
        var stat = stats[index] || new CommStatistics();
        stat.stream(stream);
        result.push(stat);
    }
    return result;
};

module.exports = StatisticsMessage;

