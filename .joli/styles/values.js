module.exports = {
  map: function (data) {
    var values = [];
    Object.keys(data).forEach(function (key) {
      values.push(data[key]);
    });
    return values;
  }
};