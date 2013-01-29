module.exports = {
  filter: function (data) {
    return !!data.text;
  },
  map: function (data) {
    return data.text;
  }
};