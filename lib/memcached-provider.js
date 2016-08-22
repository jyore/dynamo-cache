
var memcached = require('memcached');

module.exports = function(providerOptions,ttlOptions) {
  
  var client = new memcached.apply(this,providerOptions.args);
  var ttl = ttlOptions.time;
  var refreshOnGet = (ttl > 0 && ttlOptions.refreshOnGet);

  this.get = function(key,callback) {
    client.get(key, function(err,data) {

      if(data != null && refreshOnGet) {
        client.touch(key,ttl);
      }

      callback(err,data);
    });
  }

  this.put = function(key,value,callback) {
    client.set(key,value,ttl,function(err) {
      if(callback) { callback(err); }
    });
  }

}
