'use strict';
const TVGDataReader = require('./tvgdatareader');
const FileDataWriter = require('./filedatawriter');
const _fw = new FileDataWriter();
const _tvgr = new TVGDataReader();

module.exports = function(input, done, progress) {
    
    function doRetrieve() {
        let dRetrieved = new Date();
        dRetrieved.setMinutes(0, 0, 0);

        _tvgr.getData(dRetrieved, input.HoursToRetrieve, function(data) {
            _fw.writeData(input.DataFolder, data, function(){
                
            }, function(err) {
                console.log('Error saving data\r\n' + err);
            });
            progress({retrieved: dRetrieved, data: data});

        }, function(err) {
            console.log('Error retrieving data\r\n' + err);
        });
    }

    doRetrieve();
    setInterval(doRetrieve, 1000 * 60 * 60 * input.HoursToRetrieve);
};