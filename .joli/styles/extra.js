module.exports = {
  filter: function (data) {
    return !!data._extra;
  },
  map: function (data) {
    return data._extra;
  }
};