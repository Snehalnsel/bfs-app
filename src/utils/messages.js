const moment = require('moment');

function formatMessage(name, text,username,buyerId, room="") {
  return {
    name,
    text,
    username,
    buyerId,
    room,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;