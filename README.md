# dynamo-cache

An easy to apply caching mechanism for DynamoDB, written in Node.

## Introduction

This module allows you to quickly and easily add a caching layer (redis or memcached) to your application that is currently using the AWS SDK for interacting with DynamoDB, specifically through the DocumentClient API.

The dynamo-cache module extends the AWS SDK's DocumentClient object directly, allowing you to add a cache without altering any existing code. Simply require the dynamo-cache module, call the new `configCache` method on your DocumentClient instance with desired preferences, and you will instantly have a caching layer between your application and DynamoDB tables.

### Basic Example 
The following snippet shows a minimum effort example for adding caching to your application. Let's take for example, the first example from the `GettingStarted` guide, which is retrieving an item from a DynamoDB table.

    var AWS = require("aws-sdk");
    AWS.config.update({region: "us-west-2",});
    
    var docClient = new AWS.DynamoDB.DocumentClient()
    
    var params = {
        TableName: "Movies",
        Key:{
            "year": 2015,
            "title": "The Big New Movie"
        }
    };
    
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });


Now all we need to do, is call the added `cacheConfig` method on the document client with our desired options after instantiating the `DocumentClient` object. This example assumes ALL defaults will work for your application and does not modify any of the module options. For more information on available options, please continue reading below.

We will simply require the `dynamo-cache` module and then add this line after `var docClient = new AWS.DynamoDB.DocumentClient()`, and the docClient will then use the cache.

    docClient.cacheConfig();


This gives us the full program of:


    var AWS = require("aws-sdk");
    var dynamoCache = require("dynamo-cache");
    
    AWS.config.update({
      region: "us-west-2",
      endpoint: "http://localhost:8000"
    });
    
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.cacheConfig();
    
    var params = {
        TableName: "Movies",
        Key:{
            "year": 2015,
            "title": "The Big New Movie"
        }
    };
    
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });


We did not modify any code and we now have a caching layer between our application and dynamo. In this example, in the `get` function call, the cache would be checked for the corresponding item. If it was a hit, then the item would be returned from the cache. If it was a miss, it'd then go back to the DynamoDB table for the information.


