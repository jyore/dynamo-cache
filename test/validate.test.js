
var expect    = require('chai').expect;
var providers = require('../index.js').providers;
var validate  = require('../lib/validate.js');


describe('validate', function() {

  describe('#provider', function() {

    var redisProvider = {
      provider: providers.REDIS,
      args: []
    };

    var memcachedProvider = {
      provider: providers.MEMCACHED,
      args: []
    };

    var invalidProvider1 = {
      provider: 'BAD',
      args: []
    };

    it('should accept a valid provider', function() {
      expect(validate.provider(redisProvider)).to.be.true;
      expect(validate.provider(memcachedProvider)).to.be.true;
    });

    it('should reject an invalid provider', function() {
      expect(validate.provider.bind(validate.provider,invalidProvider1)).to.throw(Error);
    });

  });

});
