
var AWS     = require('aws-sdk');
var AWSMOCK = require('aws-sdk-mock');
var chai    = require('chai');
var expect  = chai.expect;
var dc      = require('../index');


// Globals
var datastore = {
  Tests: {}
};

var selector = {
  Tests: 'HashKey'
};


// Mocks
AWSMOCK.mock('DynamoDB.DocumentClient', 'put', function(params, callback) {
  datastore[params.TableName][params.Item[selector[params.TableName]]] = params.Item;
  callback(null,params);
});


AWSMOCK.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
  if(!datastore[params.TableName].hasOwnProperty(params.Key[selector[params.TableName]])) {
    return callback(null, {});
  }

  callback(null, {Item: datastore[params.TableName][params.Key[selector[params.TableName]]]});
});

AWSMOCK.mock('DynamoDB.DocumentClient', 'delete', function(params, callback) {
  delete datastore[params.TableName][params.Key[selector[params.TableName]]];
});


// Setup
var docClient = new AWS.DynamoDB.DocumentClient();
docClient.configCache({
 ttl: 1,
});


describe('dynamo-cache', function() {

  describe('put operations', function() {
  
    it('should use docClient unimpeded', function() {
      // Load test data
      docClient.put({ TableName: 'Tests', Item: { HashKey: 'Test1', Param1: 1,   Param2: 'abc' }});
      docClient.put({ TableName: 'Tests', Item: { HashKey: 'Test2', Param1: 10,  Param2: 'def' }});
      docClient.put({ TableName: 'Tests', Item: { HashKey: 'Test3', Param1: 5,   Param2: 'azy' }});
      docClient.put({ TableName: 'Tests', Item: { HashKey: 'Test4', Param1: 100, Param2: 'fas' }});
      docClient.put({ TableName: 'Tests', Item: { HashKey: 'Test5', Param1: 32,  Param2: 'pfd' }});
    });
  });
  
  describe('get operations', function() {
  
    // This test will get a known item from the datastore
    // Since key is not yet in cache, the cache is populated and current value returned
    // The datastore value gets updated, but the cached value is still fresh
    // The cached value is returned
    it('should return cached values', function(done) {
  
      var original = undefined;
      docClient.get({ TableName: 'Tests', Key: { HashKey: 'Test1' }}, function(err,data) {
        original = data;
        docClient.put({ TableName: 'Tests', Item: { HashKey: 'Test1', Param1: 2,   Param2: 'abc' }});
        docClient.get({ TableName: 'Tests', Key: { HashKey: 'Test1' }}, function(err,data) {
          expect(data.Item.Param1).to.equal(original.Item.Param1);
          expect(data.Item.Param1).to.not.equal(datastore['Tests']['Test1']['Param1']);
          done(); 
        });
      }); 
    });
  });

  // This test retrieves a known item to make sure it is in the datastore and cache
  // That item is then deleted and we try to retrieve the item again
  // The returned item should be empty
  describe('delete operations', function() {

    it('should delete items in the cache when the datastore item deletes', function(done) {

      docClient.get({ TableName: 'Tests', Key: { HashKey: 'Test5' }}, function(err,data) {
        expect(data.Item).to.exist;
        docClient.delete({ TableName: 'Tests', Key: { HashKey: 'Test5' }});
        docClient.get({ TableName: 'Tests', Key: { HashKey: 'Test5' }}, function(err,data) {
          expect(data).to.be.empty;
          done();
        });
      });
    });
  });
});
