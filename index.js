
//
// Simple Message Store application using ME(a)N stack
// -- node.js, express.js, mongodb
// by Ram D.
//

//
// Imports & Globals
//

var mongodb = require("mongodb");
var ObjectId = require("mongodb").ObjectID;
var http = require("http");
var events = require("events");
var express = require("express");
var fs = require("fs");
var assert = require("assert");
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.text());
var mongoClient = mongodb.MongoClient;

//
// Connect to mongo db - 3 cases:
// (a) db is a service in linux i.e. not docker container
// (b) db is in container linked by docker run --name web --link "db:db"
// (c) db is in container linked by docker-compose
//


// case (a) - default
var urlToConnect = "mongodb://localhost:27017/test";
if ( process.env.MONGO_URL ) {
  urlToConnect = process.env.MONGO_URL;
}

var DB_LINK_URL = process.env.DB_PORT;
if ( DB_LINK_URL ) {
  // case (b) - docker link
  urlToConnect = DB_LINK_URL.replace( "tcp", "mongodb" ) + "/test";
}

var COMPOSE_DB_HOST = process.env.COMPOSE_DB_HOST;
if ( COMPOSE_DB_HOST ) {
  // case (c): docker-compose, v1.10+ doesn't set env vars for linked containers
  urlToConnect = 'mongodb://' + COMPOSE_DB_HOST + ':27017/test';
}

console.log("EnvVar MONGO_URL: " + process.env.MONGO_URL);
console.log("EnvVar DB_PORT: " + process.env.DB_PORT);
console.log("EnvVar COMPOSE HOST: " + process.env.COMPOSE_DB_HOST);
console.log("Mongo Url: " + urlToConnect);

mongoClient.connect(urlToConnect, (err, db) => {
    assert.equal(null, err);
    console.log("MongoDB connection confirmed.");
    db.close();
});


//
// Controller - request handlers
//


// helper -- query DB using specified filter
//
var findMessages = function(db, filter, callback) {
    db.collection('messages').find(filter).toArray((err, items) => {
        assert.equal(err, null);
        callback(items);
    });
}


// LIST messages
//
var listHandler = function(req, res) {

    mongoClient.connect(urlToConnect, function(err, db) {
        assert.equal(null, err);

        findMessages(db, {}, (items) => {
            db.close();
            res.end(JSON.stringify(items));
        });
    });
}


// helper -- check if string is a palindrome
//
function isPalindrome(str) {
    var mystr = new String(str);
    for (ii = 0; ii < mystr.length/2; ii++) {
        var start = ii;
        var end = mystr.length - start - 1;
        if (mystr[start] != mystr[end]) {
            return false;
        }
    }
    return true;
}


// GET message
//
var getHandler = function(req, res) {

    mongoClient.connect(urlToConnect, (err, db) => {
        assert.equal(null, err);

        var myfilter = { "_id" : new ObjectId(req.params.id) };
        findMessages(db, myfilter, (items) => {
            db.close();
            if (items.length == 0) {
                res.writeHead(404);
                res.send();
            }
            else {
                // check if retrieved msg is a palindrome
                var ispalin = isPalindrome(items[0].message);
                items[0].ispalindrome = ispalin;
                console.log(JSON.stringify(items[0]));
                res.send(items[0]);
            }
        });
    });
}


// ADD message
//
var addHandler = function(req, res) {

    mongoClient.connect(urlToConnect, function(err, db) {
        assert.equal(null, err);

        // Let mongodb generate a UUID _id
        var docToInsert = {
            message:req.body
        }
        db.collection('messages').insertOne(docToInsert, (err, result) => {
            assert.equal(err, null);
            db.close();

            var jsonResult = JSON.parse(result);
            assert.equal(jsonResult.ok, 1);
            assert.equal(jsonResult.n, 1);
        })

        res.end(JSON.stringify(docToInsert));
        console.log("Add: " + JSON.stringify(docToInsert));
    });
}


// DELETE message
//
var deleteHandler = function(req, res) {

    mongoClient.connect(urlToConnect, (err, db) => {
        assert.equal(null, err);

        var idStr = req.params.id;
        if (idStr == 'all') {
            // delete ALL messages - to reset DB to clean

            db.collection('messages').deleteMany({}, (err, result) => {
                assert.equal(err, null);
                db.close();

                var jsonResult = JSON.parse(result);
                assert.equal(jsonResult.ok, 1);
                res.writeHead(200);
                res.end();
            });
        }

        else {
            // delete specific message

            var toDelete = { _id : new ObjectId(idStr) };
    
            db.collection('messages').deleteOne(toDelete, (err, result) => {
                assert.equal(err, null);
                db.close();

                var jsonResult = JSON.parse(result);
                //console.log("DEL result = " + result);
                assert.equal(jsonResult.ok, 1);
                if (jsonResult.n == 1) {
                    res.writeHead(200);
                }
                else {
                    res.writeHead(404);
                }
                res.end();
            });
        }
    });
}


//
// Register handlers to REST APIs & start server
//
app.get('/msg', listHandler);
app.get('/msg/:id', getHandler);
app.post('/msg', addHandler);
app.delete('/msg/:id', deleteHandler);

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Sample message store: http://%s:%s", host, port)

})


