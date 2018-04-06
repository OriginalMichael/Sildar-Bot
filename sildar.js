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
    logger.info(bot.username + ' - (' + bot.id + ')');a
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
      if (message.match(/!sildar roll d\d+/i)) {
        bot.sendMessage({
          to: channelID,
          message: 'I roll a 1! I Suck!',
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
