

var CACHE = {};


module.exports = function(providerOptions,time) {

  var ttl = time;

  this.get = function(key,callback) {

    var item = CACHE[key];

    if(item) {
      var dt = new Date().getTime() - item.created;
      if(dt > (ttl * 1000)) {
        callback(null,null);
      } else {
        callback(null,item.value);
      }
    } else {
      callback(null,null);
    }
  }

  this.put = function(key,value,callback) {
    CACHE[key] = {
      created: new Date().getTime(),
      value: value
    };

    if(callback) { callback(null); }
  }

  this.remove = function(key) {

    if(CACHE[key]) {
     delete CACHE[key];
    }
  }
};
