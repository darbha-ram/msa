
//
// Tests for RESTful API of Simple Message Store App
//

var expect    = require("chai").expect;
var request = require("request");

var baseUrl = 'http://localhost:8081/msg';

var msg1 = 'able was i ere i saw elba';
var msg2 = 'this is not palindromic';

var id1;
var id2;

var error_g;
var response_g;
var body_g;

describe("Simple Message Store API", function() {


    describe("Delete all", function() {

        before(function(done) {
            request({
                url: baseUrl + "/all",
                method: 'DELETE'
            }, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

    });

    describe("List Messages", function() {
        
        before(function(done) {
            request(baseUrl, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

        it("returns empty list", function() {
            expect(body_g).to.equal("[]");
        });

    });


    describe("Invalid request with PUT method", function() {
        
        before(function(done) {
            request.put(baseUrl, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 404", function() {
            expect(response_g.statusCode).to.equal(404);
        });

    });


    describe("Invalid request with badly formed URL", function() {
        
        before(function(done) {
            request.put(baseUrl + "/", (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 404", function() {
            expect(response_g.statusCode).to.equal(404);
        });

    });


    describe("Add palindromic message 1", function() {
        
        before(function(done) {
            request({
                url: baseUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: msg1
            }, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

        it("returns message with ID", function() {
            var jsonBody = JSON.parse(body_g);
            expect(jsonBody.message).to.equal(msg1);
            id1 = jsonBody._id;
        });

    });


    describe("Add non-palindromic message 2", function() {

        before(function(done) {
            request({
                url: baseUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: msg2
            }, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

        it("returns message with ID", function() {
            var jsonBody = JSON.parse(body_g);
            expect(jsonBody.message).to.equal(msg2);
            id2 = jsonBody._id;
        });

    });


    describe("Get message 1", function() {

        before(function(done) {
            request(baseUrl + '/' + id1, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

        it("returns message and ID", function() {
            var jsonBody = JSON.parse(body_g);
            expect(jsonBody.message).to.equal(msg1);
            expect(jsonBody._id).to.equal(id1);
        });

        it("returns palindromic true", function() {
            var jsonBody = JSON.parse(body_g);
            expect(jsonBody.ispalindrome).to.equal(true);
        });

    });


    describe("Get message 2", function() {

        before(function(done) {
            request(baseUrl + '/' + id2, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

        it("returns message and ID", function() {
            var jsonBody = JSON.parse(body_g);
            expect(jsonBody.message).to.equal(msg2);
            expect(jsonBody._id).to.equal(id2);
        });

        it("returns palindromic false", function() {
            var jsonBody = JSON.parse(body_g);
            expect(jsonBody.ispalindrome).to.equal(false);
        });

    });


    describe("List messages after additions", function() {

        before(function(done) {
            request(baseUrl, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

        it("returns 2 messages", function() {
            expect(JSON.parse(body_g).length).to.equal(2);
        });

        it("returns message 1 and ID", function() {
            expect(JSON.parse(body_g)[0]._id).to.equal(id1);
            expect(JSON.parse(body_g)[0].message).to.equal(msg1);
        });

        it("returns message 2 and ID", function() {
            expect(JSON.parse(body_g)[1]._id).to.equal(id2);
            expect(JSON.parse(body_g)[1].message).to.equal(msg2);
        });

    });


    describe("Delete message 1", function() {

        before(function(done) {
            request({
                url: baseUrl + '/' + id1,
                method: 'DELETE'
            }, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

    });


    describe("Delete non-existent message 1", function() {

        before(function(done) {
            request({
                url: baseUrl + '/' + id1,
                method: 'DELETE'
            }, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 404", function() {
            expect(response_g.statusCode).to.equal(404);
        });

    });


    describe("Get non-existent message 1", function() {

        before(function(done) {
            request(baseUrl + '/' + id1, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 404", function() {
            expect(response_g.statusCode).to.equal(404);
        });

    });


    describe("List messages after deletion", function() {

        before(function(done) {
            request(baseUrl, (error, response, body) => {
                error_g = error;
                response_g = response;
                body_g = body;
                done();
            });
        });

        it("returns HTTP 200", function() {
            expect(response_g.statusCode).to.equal(200);
        });

        it("returns 1 message", function() {
            expect(JSON.parse(body_g).length).to.equal(1);
        });

        it("returns message 2 and ID", function() {
            expect(JSON.parse(body_g)[0]._id).to.equal(id2);
            expect(JSON.parse(body_g)[0].message).to.equal(msg2);
        });

    });



});


