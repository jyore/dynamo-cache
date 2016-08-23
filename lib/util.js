
var crypto = require('crypto');


module.exports = {

  hash: function(value) {
    return crypto.createHash('sha1').update(value).digest('hex').slice(0,8);
  },
  buildKey: function(params) {

    var result = params.TableName;
    var type = undefined;
    var keys = [];


    if(params.Key) {

      type = 'Key';
      for(var key in params.Key) {
        keys.push(key + '=' + params.Key[key]);
      }
      
    } else if(params.ExpressionAttributeValues) {

      type = 'Query';
      for(var key in params.ExpressionAttributeValues) {
        keys.push(key + '=' + params.ExpressionAttributeValues[key]);
      }

    } else {
      throw new Error("Cannot build key");
    }
    
    return params.TableName + ':' + type + '(' + keys.join(',') + ')';
  }
}


