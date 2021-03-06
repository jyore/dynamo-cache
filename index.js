// External Dependencies
// ---------------------------------------------
var AWS     = require('aws-sdk');
var _       = require('underscore');

// Internal Dependencies
// ---------------------------------------------
var logger            = require('./lib/logger');
var validate          = require('./lib/validate');
var util              = require('./lib/util');
var RedisProvider     = require('./lib/redis-provider');
var MemcachedProvider = require('./lib/memcached-provider');
var InMemoryProvider  = require('./lib/inmemory-provider');


// Constants
// ---------------------------------------------
const providers = {
  IN_MEMORY: 0,
  REDIS:     1,
  MEMCACHED: 2
}


// Default Configuration
// ---------------------------------------------
var defaults = {
  debug:          false,
  providerConfig: {
    provider:     providers.IN_MEMORY,
    args:         []
  },
  ttl: 300
};


// Entry Point
// ---------------------------------------------
AWS.DynamoDB.DocumentClient.prototype.configCache = function(config) {

  var cache   = undefined;
  var options = _.extend({},defaults,config);
  var enabled = true;
  var self    = this;

  var function_cache = {
    delete:     this.delete,
    get:        this.get,
    query:      this.query,
    scan:       this.scan
  };


  // Setup Function
  // ---------------------------------------------
  function setup() {
    validate_options();
    init_cache();
  }


  // State Management
  // ---------------------------------------------
  this.enable    = function() { enabled = true;  }
  this.disable   = function() { enabled = false; }
  this.isEnabled = function() { return enabled;  }



  // Method Wrappers
  // ---------------------------------------------

  this.delete = (function() {
    return function(params,callback) {
      if(enabled) {
        var key = util.hash(util.buildKey(params));
        cache.remove(key);
      }
      
      function_cache.delete(params,callback);
    }
  })();

  this.get = (function() {
    return function(params,callback) {

      if(enabled) {

        if(options.debug) {
          logger(params);
        }

        var key = util.hash(util.buildKey(params));

        cache.get(key, function(err,reply) {

          if(err || reply) {
            callback(err,JSON.parse(reply));
          } else {

            function_cache.get.call(self, params, function(err,data) {
              if(!err) { 
                cache.put(key,JSON.stringify(data));
              }
              callback(err,data);
            });
          }
        });
      } else {
        function_cache.get(params,callback);
      }
    }
  })();

  this.query = (function() {
    return function(params,callback) {

      if(enabled) {

        if(options.debug) {
          logger(params);
        }

        var key = util.hash(util.buildKey(params));

        cache.get(key, function(err,reply) {

          if(err || reply) {
            callback(err,JSON.parse(reply));
          } else {

            function_cache.query.call(self, params, function(err,data) {
              if(!err) { 
                cache.put(key,JSON.stringify(data));
              }
              callback(err,data);
            });
          }
        });
      } else {
        function_cache.query(params,callback);
      }
    }
  })();

  this.scan = (function() {
    return function(params,callback) {

      if(enabled) {

        if(options.debug) {
          logger(params);
        }

        var key = util.hash(util.buildKey(params));

        cache.get(key, function(err,reply) {

          if(err || reply) {
            callback(err,JSON.parse(reply));
          } else {

            function_cache.scan.call(self, params, function(err,data) {
              if(!err) { 
                cache.put(key,JSON.stringify(data));
              }
              callback(err,data);
            });
          }
        });
      } else {
        function_cache.scan(params,callback);
      }
    }
  })();


  // Helper Functions
  // ---------------------------------------------

  function validate_options() {
    if(options.debug) {
      logger("Configuring dynamo-cache with options: ", JSON.stringify(options));
    }
    validate.provider(options.providerConfig);
  }

  function init_cache() {

    switch (options.providerConfig.provider) {
      case providers.IN_MEMORY:
        cache = new InMemoryProvider(options.providerConfig,options.ttl);
        break;
      case providers.REDIS:
        cache = new RedisProvider(options.providerConfig,options.ttl);
        break;
      case providers.MEMCACHED:
        cache = new MemcachedProvider(options.providerConfig,options.ttl);
        break;
      default:
        throw new Error('dynamo-cache: Unknown internal service error');
    }
  }


  // Run setup
  // ---------------------------------------------
  setup();
};


// Module Exports
// ---------------------------------------------
module.exports = {
  providers: providers
}
