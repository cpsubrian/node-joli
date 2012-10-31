var util = require('util');
module.exports = function (data) {
  console.log(util.inspect(data, false, 15, true));
};