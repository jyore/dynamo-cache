
var AWS = require('aws-sdk');
var dc  = require('../index');
var $   = require('./support');
var fs  = require('fs');

AWS.config.update({ region: 'us-west-2' });

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

var averages = [];
var individualItems = {
  "2003:2 Fast 2 Furious":     {},
  "2003:Old School":           {},
  "1999:Fight Club":           {},
  "1999:The Sixth Sense":      {},
  "1976:Carrie":               {},
  "1976:Rocky":                {},
  "1989:Batman":               {},
  "1989:Weekend at Bernie's":  {},
  "1962:The Miracle Worker":   {},
  "2014:22 Jump Street":       {},
  "2014:Birdman":              {},
  "2010:Edge of Darkness":     {},
  "2010:Marmaduke":            {},
  "1994:Natural Born Killers": {},
  "1994:The Mask":             {}
};

function get_data(next) {

  $.log('Retrieving individual items');
  var processed = Object.keys(individualItems).length;

  Object.keys(individualItems).forEach(function(key) {

    var keys = key.split(':');
    var year = keys[0];
    var title = keys[1];

    individualItems[key].start = new Date().getTime();
    docClient.get({
      TableName: "Movies",
      Key: {
        year: parseInt(year),
        title: title
      }
    }, function(err,data) {
      if(err) {
        $.logError(err);
      } else {
        if(data.Item === undefined ) {
          $.log("Couldn't retrieve data");
          finish(false);
        } else {
          individualItems[data.Item.year + ':' + data.Item.title].end = new Date().getTime();
          finish(true);
        }
      }
    });
  });


  var errors = 0;
  function finish(fail) {
    processed--;

    if(fail) {
      errors++;
    }
    if(processed === 0) {
      $.log('Retrieving individual items Complete');
      var sum = 0;
      var min = 9999999999;
      var max = -1;

      for(var key in individualItems) {
        var dt = individualItems[key].end - individualItems[key].start;
        sum += dt;
        min = (dt < min) ? dt : min;
        max = (dt > max) ? dt : max;
      }

      averages.push({
        min: min,
        max: max,
        avg: sum/Object.keys(individualItems).length,
        err: errors
      });
      next();
    }
  }
}

var years = {
  '1964' : {},
  '1975' : {},
  '1986' : {},
  '1997' : {},
  '2008' : {}
};


function query_data(next) {
  $.log('Retrieving items through query');

  var processed = Object.keys(years).length;

  Object.keys(years).forEach(function(key) {

    years[key].start = new Date().getTime();
    docClient.query({
      TableName: "Movies",
      KeyConditionExpression: "#yr = :yyyy",
      ExpressionAttributeNames: {
        "#yr" : "year"
      },
      ExpressionAttributeValues: {
        ":yyyy" : parseInt(key)
      }
    }, function(err,data) {
      if(err) {
        $.logError(err);
      } else {
        if(data.Items === undefined ) {
          $.log("Couldn't retrieve data");
          finish(false);
        } else {
          years[data.Items[0].year.toString()].end = new Date().getTime();
          finish(true);
        }
      }
    });
  });


  var errors = 0;
  function finish(fail) {
    processed--;

    if(fail) {
      errors++;
    }
    if(processed === 0) {
      $.log('Retrieving items through query Complete');
      var sum = 0;
      var min = 9999999999;
      var max = -1;

      for(var key in years) {
        var dt = years[key].end - years[key].start;
        sum += dt;
        min = (dt < min) ? dt : min;
        max = (dt > max) ? dt : max;
      }

      averages.push({
        min: min,
        max: max,
        avg: sum/Object.keys(years).length,
        err: errors
      });
      next();
    }
  }
}


var yearRanges =  {
  '1960:1969' : {},
  '1970:1979' : {},
  '1980:1989' : {},
  '1990:1999' : {},
  '2000:2009' : {}
};


function scan_data(next) {
  $.log('Retrieving items through scan');

  var processed = Object.keys(years).length;

  Object.keys(yearRanges).forEach(function(key) {

    yearRanges[key].start = new Date().getTime();

    var range = key.split(':');
    var start = parseInt(range[0]);
    var end = parseInt(range[1]);


    docClient.scan({
      TableName: "Movies",
      FilterExpression: "#yr between :start_yr and :end_yr",
      ExpressionAttributeNames: {
        "#yr" : "year"
      },
      ExpressionAttributeValues: {
        ":start_yr": start,
        ":end_yr": end 
      }
    }, function(err,data) {
      if(err) {
        $.logError(err);
      } else {
        if(data.Items === undefined ) {
          $.log("Couldn't retrieve data");
          finish(false);
        } else {

          var year = data.Items[0].year;
          var start = Math.floor(year/10)*10;
          var end = start + 9;
          var insert = start + ':' + end;

          yearRanges[insert].end = new Date().getTime();
          finish(true);
        }
      }
    });
  });


  var errors = 0;
  function finish(fail) {
    processed--;

    if(fail) {
      errors++;
    }
    if(processed === 0) {
      $.log('Retrieving items through scan Complete');
      var sum = 0;
      var min = 9999999999;
      var max = -1;

      for(var key in yearRanges) {
        var dt = yearRanges[key].end - yearRanges[key].start;
        sum += dt;
        min = (dt < min) ? dt : min;
        max = (dt > max) ? dt : max;
      }

      averages.push({
        min: min,
        max: max,
        avg: sum/Object.keys(yearRanges).length,
        err: errors
      });
      next();
    }
  }
}


var app = new $.Application();


// CREATE TABLE
app.use(function(next) {

  $.log('Creating DynamoDB Table');

  dynamodb.createTable({
    TableName: "Movies",
    KeySchema: [
      { AttributeName: "year", KeyType: "HASH" },
      { AttributeName: "title", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "year", AttributeType: "N" },
      { AttributeName: "title", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  }, function(err,data) {
    
    if(err) {
      if(err.message.startsWith('Table already exists')) {
        $.log('Table already exists');
        setTimeout(next,1000);
      } else {
        var msg = 'Could not create table: ' + JSON.stringify(err,null,2);
        $.logError(msg);
        throw Erorr(msg);
      }
    } else {
      $.log('Created table');
      $.log('Waiting 120s for table to be ready');
      setTimeout(next,120000);
    }
  });
});

// LOAD TEST DATA
app.use(function(next) {

  $.log('Importing Test Data');

  var allMovies = JSON.parse(fs.readFileSync('data/moviedata.json', 'utf8'));
  var processed = allMovies.length;

  allMovies.forEach(function(movie) {
    docClient.put({
      TableName: "Movies",
      Item: {
        "year" : movie.year,
        "title" : movie.title,
        "info" : movie.info
      }
    }, function() {
      finish();
    });
  });

  function finish() {
    processed--;
    if(processed === 0) {
      process.stdout.write('\n');
      $.log('Importing Table Data Complete');
      $.log('Waiting 60s for dynamo state to steady');
      setTimeout(next,60000);
    } else {
      process.stdout.write('.');
    }
  }
});

// Get individual items
app.use(get_data);
app.use(get_data);

// Query for items
app.use(query_data);
app.use(query_data);

// Scan for items
app.use(scan_data);
app.use(scan_data);

// DELETE TABLE
app.use(function(next) {

  $.log('Deleting Table');

  dynamodb.deleteTable({ TableName: "Movies" }, function(err,data) {
    if(err) {
      $.logError('Unable to delete table: ' + JSON.stringify(err,null,2));
    } else {
      $.log('Table deleted successfully');
    }

    next();
  });
});


module.exports = {
  docClient : docClient,
  run : function() {
    app.run(function(){
      $.log('Run Complete...Printing statistics\n');
      var avgGet = 100*(averages[0].avg - averages[1].avg)/averages[0].avg;
      var avgQuery = 100*(averages[2].avg - averages[3].avg)/averages[2].avg;
      var avgScan = 100*(averages[4].avg - averages[5].avg)/averages[4].avg;
      $.log('Dynamo Get:\n\tClient: min=' + averages[0].min + ' avg=' + averages[0].avg + ' max=' + averages[0].max + '\n\tCache: min=' + averages[1].min + ' avg=' + averages[1].avg + ' max=' + averages[1].max + '\n\tAverage Percent Speed Increase: ' + avgGet + '%');
      $.log('Dynamo Query:\n\tClient: min=' + averages[2].min + ' avg=' + averages[2].avg + ' max=' + averages[2].max + '\n\tCache: min=' + averages[3].min + ' avg=' + averages[3].avg + ' max=' + averages[3].max + '\n\tAverage Percent Speed Increase: ' + avgQuery + '%');
      $.log('Dynamo Scan:\n\tClient: min=' + averages[4].min + ' avg=' + averages[4].avg + ' max=' + averages[4].max + '\n\tCache: min=' + averages[5].min + ' avg=' + averages[5].avg + ' max=' + averages[5].max + '\n\tAverage Percent Speed Increase: ' + avgScan + '%');

      if(avgGet < 20 || avgQuery < 20 || avgScan < 20) {
        var msg = 'Cache access times too high, check for potential errors';
        $.logError(msg);
        throw new Error(msg);
      }
    });
  }
}

