const moment = require('moment');

function formatMessage(name, text,username, room="") {
  return {
    name,
    text,
    username,
    room,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;