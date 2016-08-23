
var expect = require('chai').expect;
var util   = require('../lib/util');


describe('util', function() {

  describe('#hash', function() {

    var hash = util.hash("example");
  
    it('should generate a hash', function() {
      expect(hash).to.exist;
      expect(hash).to.have.lengthOf(8);
      expect(hash).to.equal('c3499c27');
    });
  
    it('should have a hash of hex values', function() {
      var result = new RegExp(/^[a-f0-9]{8}$/g).test(hash);
      expect(result).to.be.true;
    });
  
    it('should change if data is updated', function() {
      var other = util.hash("examples");
      expect(hash).to.not.equal(other);
    });
  
    it('should evaluate consistently', function() {
      for(var i=0;i<10;++i) {
        expect(hash).to.equal(util.hash("example"));
      }
    });

  });

  describe('#buildKey', function() {

    it('should build a key from params w/ a hash key', function() {

      var result = util.buildKey({
        TableName: 'Test',
        Key: {
          HashKey: 'example'
        }
      });

      expect(result).to.equal('Test:Key(HashKey=example)');

    });

    it('should build a key from params w/ a hash and sort key', function() {

      var result = util.buildKey({
        TableName: 'Test',
        Key: {
          HashKey: 'example',
          SortKey: 'sort'
        }
      });

      expect(result).to.equal('Test:Key(HashKey=example,SortKey=sort)');

    });

    it('should build a key from expression attributes', function() {

      var result = util.buildKey({
        TableName: 'Test',
        ExpressionAttributeValues: {
          Param1: 'value1',
          Param2: 'value2'
        }
      });

      expect(result).to.equal('Test:Query(Param1=value1,Param2=value2)');
    });

    it('should fail if no Key or ExpressionAttributeValues', function() {
      expect(util.buildKey.bind(util.buildKey,{})).to.throw(Error);
    });
  });

});
