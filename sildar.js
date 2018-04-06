var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

module.exports.start = () => {
  logger.remove(logger.transports.Console);
  logger.add(logger.transports.Console, {
    colorize: true
  });
  logger.level = 'debug';

  var bot = new Discord.Client({
    token: auth.token,
    autorun: true
  });

  bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
  });

  bot.on('message', function (user, userID, channelID, message, evt) {
    try {
      if (message.match(/!roll d\d+/i)) {
        const max = message.match(/!roll d(\d+)/i)[1];
        const result = (Math.floor((Math.random() * max)) + 1).toString();
        bot.sendMessage({
          to: channelID,
          message: `${user} rolls a ${result}!`,
        }); 
        return;
      }
      if (message.match(/!roll \d+d\d+/i)) {
        const match = message.match(/!roll (\d+)d(\d+)/i);
        const num = match[1];
        const max = match[2];
        const result = [];
        let sum = 0;
        for (let i = 0; i < num; i++) {
          const val = Math.floor((Math.random() * max)) + 1;
          result.push(val);
          sum += val;
        }
        bot.sendMessage({
          to: channelID,
          message: `${user} rolls ${result} = ${sum}!`.replace(/,/g, ' + '),
        }); 
        return;
      }
      if (message.match(/!sildar roll d\d+/i)) {
        bot.sendMessage({
          to: channelID,
          message: 'I roll a 1! I Suck!',
        }); 
        return;    
      }
      if (message.match(/!sildar roll \d+d\d+/i)) {
        bot.sendMessage({
          to: channelID,
          message: 'I somehow roll a 1! I Suck!',
        }); 
        return;
      }
    } catch (err) {
      console.log(err);
      bot.sendMessage({
        to: channelID,
        message: 'Someone broke me!',
      }); 
    }
  });
}
