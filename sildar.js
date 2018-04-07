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
      if (message.match(/!commands/i)) return listCommands(channelID);
      if (message.match(/!roll d\d+/i)) return rollSingle(user, channelID, message);
      if (message.match(/!roll \d+d\d+/i)) return rollMultiple(user, channelID, message);
      if (message.match(/!proll d\d+/i)) return privateRollSingle(userID, message);
      if (message.match(/!proll \d+d\d+/i)) return privateRollMultiple(userID, message);
      if (message.match(/!sildar roll d\d+/i)) return sildarRollSingle(channelID);
      if (message.match(/!sildar roll \d+d\d+/i)) return sildarRollMultiple(channelID, message);
      if (message.match(/!sildar/i)) return sildarStatus(channelID);
      if (message.match(/!varjil/i)) return varjilQuotes(channelID);
      if (message.match(/!ilthar/i)) return iltharQuotes(channelID);
    } catch (err) {
      console.log(err);
      bot.sendMessage({
        to: channelID,
        message: 'Someone broke me!',
      }); 
    }
  });

  const listCommands = (channelID) => {
    const list = [
      '!commands',
      '!roll dxx',
      '!roll xdxx',
      '!proll dxx',
      '!proll xdxx',
      '!sildar roll dxx',
      '!sildar roll xdxx',
      '!sildar',
      '!varjil',
      '!ilthar',
    ];
    const commands = `${list}`.replace(/,/g, '\n');
    bot.sendMessage({
      to: channelID,
      message: commands,
    }); 
  }

  const rollSingle = (user, channelID, message) => {
    const max = message.match(/!roll d(\d+)/i)[1];
    const result = (Math.floor((Math.random() * max)) + 1).toString();
    bot.sendMessage({
      to: channelID,
      message: `${user} rolls a ${result}!`,
    });
  }

  const privateRollSingle = (userID, message) => {
    const max = message.match(/!proll d(\d+)/i)[1];
    const result = (Math.floor((Math.random() * max)) + 1).toString();
    bot.sendMessage({
      to: userID,
      message: `You roll a ${result}!`,
    });
  }

  const rollMultiple = (user, channelID, message) => {
    const match = message.match(/!roll (\d+)d(\d+)/i);
    const num = match[1];
    const max = match[2];
    const result = [];
    let sum = 0;
    if (num === '1') return rollSingle(user, channelID, message);
    for (let i = 0; i < num; i++) {
      const val = Math.floor((Math.random() * max)) + 1;
      result.push(val);
      sum += val;
    }
    bot.sendMessage({
      to: channelID,
      message: `${user} rolls ${result} = ${sum}!`.replace(/,/g, ' + '),
    }); 
  }

  const privateRollMultiple = (userID, message) => {
    const match = message.match(/!proll (\d+)d(\d+)/i);
    const num = match[1];
    const max = match[2];
    const result = [];
    let sum = 0;
    if (num === '1') return privateRollSingle(userID, message);
    for (let i = 0; i < num; i++) {
      const val = Math.floor((Math.random() * max)) + 1;
      result.push(val);
      sum += val;
    }
    bot.sendMessage({
      to: userID,
      message: `You roll ${result} = ${sum}!`.replace(/,/g, ' + '),
    });
  }

  const sildarRollSingle = (channelID) => {
    bot.sendMessage({
      to: channelID,
      message: 'I roll a 1! I Suck!',
    });
  }

  const sildarRollMultiple = (channelID, message) => {
    if (message.match(/!sildar roll 1d\d+/i)) return sildarRollSingle(channelID);
    bot.sendMessage({
      to: channelID,
      message: 'I somehow roll a 1! I Suck!',
    });
  }

  const sildarStatus = (channelID) => {
    bot.sendMessage({
      to: channelID,
      message: 'Sildar is up and running!',
    });
  }

  const varjilQuotes = (channelID) => {
    bot.sendMessage({
      to: channelID,
      message: 'I am black. <:varjilisblack:431658564101210122>',
    });
  }

  const iltharQuotes = (channelID) => {
    const list = [
      'Do you have burgers?',
      'I want a fifteen feet long two by four.',
      'Here, have 20 gold.',
      'I will have one of everything. Bring it to my room.',
    ];
    const random = Math.floor((Math.random() * list.length));
    const quote = `${list[random]} - Ilthar~`;
    bot.sendMessage({
      to: channelID,
      message: quote,
    });
  }
}
