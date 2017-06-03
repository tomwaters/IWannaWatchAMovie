'use strict';
const http = require('http');

module.exports = class TVGDataReader {
    getData(datetime, duration, success, error) {
        let date = this.padDate(datetime.getDate()) + '/' + this.padDate(datetime.getMonth() + 1) + '/' + datetime.getFullYear();
        let paddedDuration = this.padDate(duration);

        let path = '/?catcolor=000000&systemid=7&thistime=' + datetime.getHours() + '&thisday=' + date + '&gridspan=' + paddedDuration + ':00&view=0&gw=1323'
        let options = {
            host: 'www.tvguide.co.uk',
            port: 80,
            path: path
        };

        http.get(options, function(response) {
            let body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                success(body);
            });
        }).on('error', function(e) {
            error(e.message);
        });
    }

    padDate(d) {
        return parseInt(d) < 10 ? '0' + d : d;
    }
}