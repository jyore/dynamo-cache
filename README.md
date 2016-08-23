# dynamo-cache

An easy to apply caching mechanism for DynamoDB, written in Node.

## Introduction

This module allows you to quickly and easily add a caching layer (in-memory, redis, or memcached) to your application that is currently using the AWS SDK for interacting with DynamoDB, specifically through the DocumentClient API.

This module aims to allow adding the cache layer **WITHOUT** having to modify exiting business logic. Simply requiring the module and calling the `cacheConfig` method is all that is required to start caching!

> **NOTE**: The current implementation only implements a *Write-Around* Caching Strategy. This means that on write, the cache is skipped and the data is written only to the DynamoDB table. When the data is subsequently read, it will be cached for the specified TTL *(default: 300s)*. 
>
> This is a design decision in order to avoid modification of the AWS SDK calls, as the PUT commands do not have an inherit way of identifying the hash and/or sort key. In the future, this module will hopefully support *Write-Through* and *Write-Around* strategies.


### Minimal Example 

This example shows the minimal work needed to add a cache to your DynamoDB client. This example will use the defaults, which uses an in-memory cache. To use a redis or memcached distribution, please follow later documentation to configure those caching providers.


    var AWS = require('aws-sdk');              // Require the AWS SDK
    var dynamoCache = require('dynamo-cache'); // Require the dynamo-cache modules

    // Create the DocumentClient instance
    var docClient = new AWS.DynamoDB.DocumentClient();

    // Setup the cache
    docClient.cacheConfig();


Your application will now use an in-memory cache!
