'use strict';
const fs = require('fs');

module.exports = class FileDataReader {
    getData(path, success, error) {
        fs.readFile(path, 'utf-8', function(err, data) {
            if(err) {
                error(err);
            }

            success(data);
        });
    }
}