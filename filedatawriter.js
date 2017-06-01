'use strict';
const fs = require('fs');

module.exports = class FileDataReader {
    writeData(path, data, success, error) {
        let d = new Date();
        let name = path + '/' + d.toISOString() + '.data';
        fs.writeFile(name, data, function() {
            success();
        }, function(err) {
            error(err);
        });
    }
}