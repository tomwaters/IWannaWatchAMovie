'use strict';
const FileDataReader = require('./filedatareader');
const FileDataWriter = require('./filedatawriter');
const TVGDataReader = require('./tvgdatareader');
const Parser = require('./parser.js');

module.exports = class DataController {
    constructor() {
        let self = this;
        self.HoursToRetrieve = 6;
        self.DataFolder = './data/';
        self._fr = new FileDataReader();
        self._fw = new FileDataWriter();
        self._tvgr = new TVGDataReader();
        self._parser = new Parser();
        self._retrievedTime = null;
        self._retriving = false;

        // Get the most recent saved data
        self._fr.getData(self.DataFolder, function(data, lastModified) {
            self._retrievedTime = lastModified;
            self._parser.parse(data, lastModified, self.HoursToRetrieve);
            self._startRetrieving();
        }, function(err) {
            self._startRetrieving();
            if(err != 'IWWM_NODATA') {
                console.log('Error reading data file\r\n' + err);
            }
        });
    }

    _startRetrieving() {
        let dTest = new Date();
        dTest.setHours(dTest.getHours() - this.HoursToRetrieve + 2);

        // If it is older than 2hrs, get new data
        if(this._retrievedTime == null || this._retrievedTime < dTest) {
            this._retrieveData();
        }
        // while(true) {
        //     if(!this._retrieving) {
        //         this._retrieveData();
        //     }
        //     //wait a few hours
        // }
    }

    // Retrieve data, set retrievedTime and save the data
    _retrieveData() {
        let self = this;
        self._retriving = true;

        let dRetrieved = new Date();
        dRetrieved.setMinutes(0, 0, 0);

        self._tvgr.getData(dRetrieved, self.HoursToRetrieve, function(data) {
            self._retrievedTime = dRetrieved;
            self._parser.parse(data, self._retrievedTime, self.HoursToRetrieve);
            self._retriving = false;

            self._fw.writeData(self.DataFolder, data, null, function(err) {
                console.log('Error saving data\r\n' + err);
            });
            
        }, function(err) {
            console.log('Error retrieving data\r\n' + err);
            self._retriving = false;
        });
    }

    get programmes() {
        return this._parser.programmes;
    }

    get retrievedTime() {
        return this._retrievedTime;
    }
}