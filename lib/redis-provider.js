
var redis = require('redis');
var _     = require('underscore');

module.exports = function(providerOptions,time) {

  var client = redis.createClient.apply(this,providerOptions.args);
  var ttl = time;

  this.get = function(key,callback) {
    client.get(key, callback);
  }

  this.put = function(key,value,callback) {

    client.set(key,value, function(err, reply) {

      if(ttl > 0) {
        client.expire(key,ttl);
      }

      if(callback) { callback(err,reply); }
    });
  }

  this.remove = function(key) {
    client.del(key);
  }
}
