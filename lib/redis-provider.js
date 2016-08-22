
var redis = require('redis');
var _     = require('underscore');

module.exports = function(providerOptions,ttlOptions) {

  var client = redis.createClient.apply(this,providerOptions.args);
  var ttl = ttlOptions.time;
  var refreshOnGet = (ttl > 0 && ttlOptions.refreshOnGet);

  this.get = function(key,callback) {
    client.get(key, function(err,reply) {

      if(reply != null && refreshOnGet) {
        client.expire(key,ttl);
      }

      callback(err,reply);
    });
  }

  this.put = function(key,value,callback) {

    client.set(key,value, function(err, reply) {

      if(ttl > 0) {
        client.expire(key,ttl);
      }

      if(callback) { callback(err,reply); }
    });
  }
}
