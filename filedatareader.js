'use strict';
const fs = require('fs');

module.exports = class FileDataReader {
    mostRecent(path) {
        let files = fs.readdirSync(path);
        if(files.length < 1) {
            return null;
        }

        let newest = path + files[0];
        for (let i=0; i<files.length; i++) {
            let f = path + files[i];
            if(fs.statSync(f).mtime.getTime() > fs.statSync(newest).mtime.getTime()) {
                newest = f;
            }
        }
        return newest;
    }

    getData(path, success, error) {
        let mostRecent = this.mostRecent(path);
        if(mostRecent == null) {
            error('IWWM_NODATA');
        }

        fs.readFile(mostRecent, 'utf-8', function(err, data) {
            if(err) {
                error(err);
            }

            let lastModified = fs.statSync(mostRecent).mtime.getTime();
            success(data, lastModified);
        });
    }
}