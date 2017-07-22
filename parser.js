'use strict';
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const $ = require('jquery')(new JSDOM().window)

module.exports = class Parser {
    constructor() {
        this.start = '';
        this.end = '';
        this.channels = [];
        this.programmes = [];
    }
    parse(data, retrievedTime, retrievedHours) {
        this.start = retrievedTime;
        this.end = new Date(retrievedTime);
        this.end.setHours(this.end.getHours() + retrievedHours);

        this.getChannels(data);
        this.getProgrammes(data);

        this.programmes.sort(function(a,b) {
            return a.Start - b.Start;
        });
    }

    getChannels(data) {
        let self = this;
        self.channels = [];
        $.each($(data).find('.div-epg-channel'), function(index, item) {
            let name = $(item).find('.div-epg-channel-name').text();
            let icon = $(item).find('.img-channel-logo').attr('src');
            
            self.channels.push({
                Name: name,
                Icon: icon
            })
        });
    }

    getProgrammes(data) {
        let self = this;
        self.programmes = [];
        $.each($(data).find('.div-epg-programme'), function(index, item) {
            let $p = $(item).find('[qt-title]');
            let text = $('<div>').append($($p.attr('qt-text')));

            let category = $(text).find('div:eq(0)').text();
            let channel = $(text).find('b').text();
            let description = $(text).children().remove().end().text();
            let title = $p.attr('qt-title').split(/\s+(.*)\s+(.*)/);
            let time = title[0].split('-');
            title = title[1];

            let start = self.parseTime(time[0]);
            let testStart = new Date(start);
            testStart.setDate(testStart.getDate() + 1);
            if(testStart < self.end) {
                start = testStart;
            }
        
            let end = self.parseTime(time[1]);
            if(end < self.start) {
                end.setDate(end.getDate() + 1);
            }

            let newProgramme = {
                Start: start,
                End: end,
                Title: title,
                Channel: channel,
                Category: category,
                Description: description
            };

            if(self.favourHDSkip(newProgramme)) {
                return;
            }

            if(!self.updateSplit(newProgramme)) {
                self.programmes.push(newProgramme);
            }
        });
    }

    favourHDSkip(newProgramme) {
        for(let i=0; i<this.programmes.length - 1; i++) {
            let element = this.programmes[i];
            if(element.Title == newProgramme.Title && element.Channel != newProgramme.Channel && 
                (element.Start.getTime() == newProgramme.Start.getTime() || element.End.getTime() == newProgramme.End.getTime())) {
                if(newProgramme.Channel.endsWith('HD') && element.Channel.startsWith(newProgramme.Channel.replace(/\s*HD/, ''))) {
                    // if this is hd and we got sd, remove sd
                    this.programmes.splice(i, 1);
                    return false;
                } else if(element.Channel.endsWith('HD') && newProgramme.Channel.startsWith(element.Channel.replace(/\s*HD/, ''))) {
                    // if this is sd and we got hd, skip
                    return true;
                }
            }
        }
        return false;
    }
    // handle movies with a break (will break tv episodes)
    updateSplit(newProgramme) {
        return this.programmes.some(function(element) {
            if(element.Title == newProgramme.Title && element.Channel == newProgramme.Channel) {
                if(element.Start < newProgramme.Start) {
                    element.End = newProgramme.End;
                } else {
                    element.Start = newProgramme.Start;
                }
                return true;
            }
            return false;
        });
    }

    parseTime(time) {
        let d = new Date(this.start);
        let tSplit = time.match(/(\d+):(\d+)(am|pm)/);
        let hr = tSplit[1] == '12' && tSplit[3] == 'am' ? 0 : tSplit[3] == 'pm' ? parseInt(tSplit[1]) + 12 : parseInt(tSplit[1]);
        
        d.setHours(hr, tSplit[2], 0, 0);
        return d;
    }
}