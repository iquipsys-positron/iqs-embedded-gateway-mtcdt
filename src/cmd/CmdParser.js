"use strict";

function CmdParser() {

}

CmdParser.prototype.parse = function() {
    var params = {};
    var paramName = "";
    
    for (var i = 2; i < process.argv.length; i++) {
        var value = process.argv[i] || "";

        if (value.startsWith("-")) {
            paramName = value.substring(1);
            params[paramName] = true;
        } else if (paramName != "") {
            params[paramName] = value;
            paramName = "";
        }
    }

    return params;
}

module.exports = CmdParser;
