'use strict';
const DataReader = require('./filedatareader');
const Parser = require('./parser.js');

module.exports = class DataController {
    constructor() {
        this.dr = new DataReader();
        this.parser = new Parser();
        this.getData();
    }

    get programmes() {
        return this.parser.programmes;
    }
/*
    get retrievedTime() {
        let dRetrieved = new Date();
        dRetrieved.setMinutes(0, 0, 0);
        return dRetrieved;
    }*/
    get retrievedTime() {
        return new Date('2017-05-29T20:00:00')
    }

    getData() {
        let self = this;
        let dRetrieved = self.retrievedTime;
        let duration = 6;

        //self.dr.getData(dRetrieved, duration, function(data) {
        self.dr.getData('./data.txt', function(data) {
            self.parser.parse(data, dRetrieved, duration);
        }, function(error) {
            console.log(error);
        });
    }
}