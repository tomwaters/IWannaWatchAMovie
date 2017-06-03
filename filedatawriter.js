'use strict';
const fs = require('fs');

module.exports = class FileDataReader {
    writeData(path, data, success, error) {
        let d = new Date();
        let name = path + 'data.txt';
        fs.writeFile(name, data, function(err) {
            if(err) {
                error(err);
            } else {
                success();
            }
        });
    }
}