var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var quotes = require('./data/quotes.json');
var words = require('./data/words_dictionary.json');

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
  
  bot.on('disconnect', function (msg, code) {
    if (code === 0) return console.log(msg);
    bot.connect();
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
      if (message.match(/can scott spell.*/i)) return spellScott(channelID, message);
      return quote(channelID, message);
    } catch (err) {
      console.log(err);
      bot.sendMessage({
        to: channelID,
        message: 'Someone broke me!',
      }); 
    }
  });

  const listCommands = (channelID) => {
    const list = quotes['!commands'].quotes;
    const commands = `${list}`.replace(/,/g, '\n');
    bot.sendMessage({
      to: channelID,
      message: commands,
    }); 
  }

  const rollSingle = (user, channelID, message) => {
    const max = message.match(/!roll d(\d+)/i)[1];
    const result = (randomInteger(1, max)).toString();
    bot.sendMessage({
      to: channelID,
      message: `${user} rolls a ${result}!`,
    });
  }

  const privateRollSingle = (userID, message) => {
    const max = message.match(/!proll d(\d+)/i)[1];
    const result = (randomInteger(1, max)).toString();
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
    if (num === '1') return rollSingle(user, channelID, message.replace('!roll 1d', '!roll d'));
    for (let i = 0; i < num; i++) {
      const val = randomInteger(1, max);
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
    if (num === '1') return privateRollSingle(userID, message.replace('!proll 1d', '!proll d'));
    for (let i = 0; i < num; i++) {
      const val = randomInteger(1, max);
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
  
  const spellScott = (channelID, message) => {
    let word = message.match(/can scott spell(.*)/i)[1].toLowerCase().trim().split(' ')[0];
    const isQuestion = word.slice(-1) === '?';
    if (isQuestion) word = word.slice(0, -1);
    let response;
    if (!word.length || word === '?') {
      response = 'Nope!';
    } else if (!words[word]) {
      response = 'Nope! You can\'t spell either!';
    } else {
      const num = word.length;
      const probability = Math.floor(100 * Math.sqrt(num) / num);
      const result = randomInteger(1, 100);
      if (result <= probability) {
        response = 'Surprisingly, yes.';
      } else if (result <= probability * 2) {
        const messages = [
          'Maybe.',
          'Probably not.',
          'There is a chance.',
          'Unlikely.',
          'Highly unlikely.',
          'Probably.',
          'Doubtful.',
          'Improbable.',
          'Almost certainly.',
          'I doubt it, but I\'m Sildar so what do I know?',
        ];
        response = messages[randomInteger(0, messages.length - 1)];
      } else {
        response = 'Nope!';
      }
    }
    bot.sendMessage({
      to: channelID,
      message: `${word}? ${response}`,
    });
  }

  const quote = (channelID, message) => {
    const who = message.split(' ')[0].toLowerCase();
    const hasQuote = quotes[who];
    if (!hasQuote) return;
    const list = hasQuote.quotes;
    const signature = hasQuote.signature;
    const regex = new RegExp(`${who} (\\d+)`, 'i');
    let num = 0;
    try {
      const query = message.match(regex);
      if (query.length > 1) num = query[1];
    } catch (err) {}
    if (num > list.length || num < 1) {
      num = randomInteger(0, list.length - 1);
    } else {
      num -= 1; 
    }
    let processed = list[num];
    const toProcess = processed.match(/\${\d+ to \d+}/g);
    let numRandom = 0;
    if (toProcess) numRandom = toProcess.length;
    for(let i = 0; i < numRandom; i++) {
      const min = processed.match(/\${(\d+)/)[1];
      const max = processed.match(/\${\d+ to (\d+)/)[1];
      processed = processed.replace(/\${\d+ to \d+}/, randomInteger(min, max));
    }
    let quote = processed;
    if (signature.length) quote = `${quote} ${signature}`;
    if (list.length > 1) quote = `${quote} (${num + 1}/${list.length})`;
    bot.sendMessage({
      to: channelID,
      message: quote,
    });
  }
  
  const randomInteger = (min, max) => {
    min = parseInt(min);
    max = parseInt(max);
    if (min > max) return -1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
