// External Dependencies
// ---------------------------------------------
var AWS     = require('aws-sdk');
var _       = require('underscore');

// Internal Dependencies
// ---------------------------------------------
var logger            = require('./lib/logger');
var validate          = require('./lib/validate');
var RedisProvider     = require('./lib/redis-provider');
var MemcachedProvider = require('./lib/memcached-provider');


// Constants
// ---------------------------------------------
const strategies = {
  WRITE_THROUGH: 0,
  WRITE_AROUND:  1
}

const providers = {
  REDIS:     0,
  MEMCACHED: 1
}


// Default Configuration
// ---------------------------------------------
var defaults = {
  debug:          false,
  providerConfig: {
    provider:     providers.REDIS,
    args:         []
  },
  strategy:       strategies.WRITE_THROUGH,
  ttl:            {
    refreshOnGet: false,
    time:         0
  }
};


// Entry Point
// ---------------------------------------------
AWS.DynamoDB.DocumentClient.prototype.configCache = function(config) {

  var cache   = undefined;
  var options = _.extend({},defaults,config);
  var enabled = true;

  var function_cache = {
    batchGet:   this.batchGet,
    batchWrite: this.batchWrite,
    createSet:  this.createSet,
    delete:     this.delete,
    get:        this.get,
    put:        this.put,
    query:      this.query,
    scan:       this.scan,
    update:     this.update
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

  this.batchGet = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.batchGet.apply(this,arguments);
    }
  })();

  this.batchWrite = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.batchWrite.apply(this,arguments);
    }
  })();

  this.createSet = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.createSet.apply(this,arguments);
    }
  })();

  this.delete = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.delete.apply(this,arguments);
    }
  })();

  this.get = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.get.apply(this,arguments);
    }
  })();

  this.put = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.put.apply(this,arguments);
    }
  })();

  this.query = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.query.apply(this,arguments);
    }
  })();

  this.scan = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.scan.apply(this,arguments);
    }
  })();

  this.update = (function() {
    return function() {
      throw new Error('dynamo-cache: Method Not Implemented');
      //function_cache.update.apply(this,arguments);
    }
  })();


  // Helper Functions
  // ---------------------------------------------

  function validate_options() {
    if(options.debug) {
      logger("Configuring dynamo-cache with options: ", JSON.stringify(options));
    }
    validate.strategy(options.strategy);
    validate.provider(options.providerConfig);
  }

  function init_cache() {

    switch (options.providerConfig.provider) {
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
  strategies: strategies,
  providers: providers
}