
var AWS = require('aws-sdk');
var dc = require('../index');

var docClient = new AWS.DynamoDB.DocumentClient();

docClient.configCache({
  debug: true
});


docClient.query({},function(err,data) {
  console.log(err,data); 
});
