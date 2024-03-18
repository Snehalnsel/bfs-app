const moment = require('moment');

function acceptFormatMessage(name1, text1, name2, text2,isFormBuyer, room="") {
  return {
    name1,
    text1,
    name2, 
    text2,
    isFormBuyer,
    room,
    time: moment().format('h:mm a')
  };
}

module.exports = acceptFormatMessage;