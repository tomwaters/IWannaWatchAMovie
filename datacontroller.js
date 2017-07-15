'use strict';
const FileDataReader = require('./filedatareader');
const Parser = require('./parser.js');
const threads = require('threads');
const spawn   = threads.spawn;
const config  = threads.config;

module.exports = class DataController {
    constructor() {
        let self = this;
        self.HoursToRetrieve = 6;
        self.DataFolder = './data/';
        self._fr = new FileDataReader();
        self._parser = new Parser();
        self._retrievedTime = null;

        config.set({
            basepath : {
                node    : __dirname
            }
        });

        // Get the most recent saved data
        self._fr.getData(self.DataFolder, function(data, lastModified) {
            self._retrievedTime = lastModified;
            self._parser.parse(data, lastModified, self.HoursToRetrieve);

            // Figure out when to start retrieving
            let dStart = new Date(self._retrievedTime);
            dStart.setHours(dStart.getHours() + self.HoursToRetrieve - 3);
            let startIn = dStart - Date.now();
            startIn = startIn < 0 ? 0 : startIn;
            setTimeout(function() {
                self._startRetrieving();
            }, startIn);

        }, function(err) {
            self._startRetrieving();
            if(err != 'IWWM_NODATA') {
                console.log('Error reading data file\r\n' + err);
            }
        });
    }

    _startRetrieving() {
        let self = this;
        let thread = spawn('datacontroller_worker.js');

        thread.send({ HoursToRetrieve: self.HoursToRetrieve,
                        DataFolder: self.DataFolder})
            .on('progress', function(progress) {
                self._retrievedTime = progress.retrieved;
                self._parser.parse(progress.data, self._retrievedTime, self.HoursToRetrieve);
            });
    }

    get programmes() {
        return this._parser.programmes;
    }

    get retrievedTime() {
        return this._retrievedTime;
    }
}