'use strict';
const SlackBot = require('slackbots');

module.exports = class IWWMSlackBot {
    constructor(onGetProgrammes) {
        let self = this;

        let token = process.env.SLACKTOKEN;
        let botName = process.env.SLACKNAME;
        if(!token || !botName) {
            return;
        }
        
        self.bot = new SlackBot({
            token: token,
            name: botName
        });

        self.bot.on('start', function() {
            self.bot.getUserId(self.bot.name).then(function(id) {
                self.userId = id;
            });
        });

        self.bot.on('message', function(message) {          
            // on messages not from this bot in a chat channel
            if(message.type === 'message' && message.user != self.userId) {
                let programmes = onGetProgrammes();
                if(message.text.toLowerCase() === 'iwannawatchamovie') {
                    if(message.channel === 'string' && message.channel[0] === 'C') {
                        // channel message
                        self.bot.postMessage(message.channel, self.getSoon(programmes));
                    } else {
                        // direct message
                        self.bot.postMessage(message.user, self.getSoon(programmes));
                    }
                }
            }
        });
    }

    getSoon(programmes) {
        function padTwo(a) {
            return a < 10 ? '0' + a : '' + a;
        }

        let now = new Date();
        let onehr = new Date().setHours(now.getHours() + 1);

        // filter to programmes starting soon
        let soon = programmes.filter(function(p) {
            return p.Start > now && p.Start < onehr;
        });
        
        // sort by start
        soon.sort(function(a, b){
            return a.Start - b.Start;
        });

        // assemble response
        let message = 'Movies starting soon:\n';
        soon.forEach(function(p) {
            message += padTwo(p.Start.getHours()) + ':' + padTwo(p.Start.getMinutes());
            message += ' - ' + p.Title + ' (' + p.Channel + ')\n';
        });

        return message;
    }
}