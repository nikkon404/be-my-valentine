const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  CSV_PATH: path.join(__dirname, 'data.csv'),
  CODE_LENGTH: 7,
  MAX_NAME_LENGTH: 64,
  STATUS: {
    NOT_RESPONDED: 'not responded',
    YES: 'yes',
    NO: 'no',
  },
};
