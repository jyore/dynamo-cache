
var memcached = require('memcached');

module.exports = function(providerOptions,time) {
  
  var client = new memcached.apply(this,providerOptions.args);
  var ttl = time;

  this.get = function(key,callback) {
    client.get(key, callback);
  }

  this.put = function(key,value,callback) {
    client.set(key,value,ttl,function(err) {
      if(callback) { callback(err); }
    });
  }

  this.remove = function(key) {
    client.del(key);
  }
}
