Simple Message Store App
==============
by Ram Darbha

Architecture
------------
* [Node.js](https://nodejs.org) and [Express.js](http://expressjs.com/) web application frameworks
* [Mongodb](http://www.mongodb.org/) for NoSQL storage
* [Docker](https://www.docker.io/), and [Docker Compose](https://docs.docker.com/compose/) for portable development and deployment
* [Mocha](https://mochajs.org) Javascript test framework and [Chai](chaijs.com) assertion library for testing 

This is an implementation of a simple headless web server that presents a RESTful API for operations to add, delete, retrieve and list text messages.  The node.js/express.js frameworks implement the web service while a mongodb database provides the persistent store.


API
---

    Operation            HTTP Method   URI                                 Response

    Get message 23       GET           http://localhost:8081/msg/23        200; 404 if not found
                                                                           Body:
                                                                           {
                                                                               id: "23",
                                                                               msg: "asd fadf adsf adsf asd f",
                                                                               palindrome: "no"
                                                                           }
                                                                        
    Delete msg 23        DELETE        http://localhost:8081/msg/23        200; 404 if not found

    Delete all msgs      DELETE        http://localhost:8081/msg/all       200;

    List all messages    GET           http://localhost:8081/msg           200;
                                                                           Body:
                                                                           [
                                                                               {
                                                                                   id: "23",
                                                                                   msg: "asd fadf adsf adsf asd f",
                                                                               },
                                                                               {
                                                                                   id: "25",
                                                                                   msg: " ghjkjghkhjgkjkjh",
                                                                               }
                                                                           ]

    Add message          POST          http://localhost:8081/msg           200 if ok
                                       Body:                               Body:
                                       abc cba                             {
                                                                               id: "23",
                                                                               msg: "abc cba"
                                                                           }



Object Model
------------

The object model in this app is very simple: a single collection called "messages" with 2 fields:
* `message`: a text field to store the user-supplied message
* `_id`: a UUID generated by MongoDB

How to Setup 
------------

* Install Docker v1.11.0+
* Install docker-compose v1.7.0+
* Clone this repo: `git clone https://github.com/darbha-ram/msgstoreapp.git msa_dir`

How to Build and Deploy 
------------
docker-compose uses the specification in docker-compose.yaml to build the web image, deploy the db container, then deploy the web container linking it to the db.

* Change directory: `cd msa_dir`
* Build and deploy the web app and database containers: `docker-compose up`

How to Build and Deploy Manually
----------------------

If you choose, these are the steps to deploy the containers directly, without using docker-compose.

* Change directory: `cd msa_dir`
* Build web app: `docker build --tag "msa" .`
* Start Mongo db:  `docker run --name db -d -p 27017:27017 mongo:3.0.11`
* Start web app: `docker run --name web -d -p 8081:8081 --link db msa`

Testing
-------

* Change directory: `cd msa_dir`
* Run test: `npm test`


Notes
-----

- Implementation is based on public node:argon and mongo:3.0.11 docker images.
- Public images will be pulled down by docker the first time they are needed for build or deployment.  Thereafter they will be available locally, can be viewed using `docker images`.
- The model and controller (API) are very simple and in a single file index.js.
- Server does not track users, so any HTTP request can view or operate on any messages.
- These Node.js extensions are needed to build & deploy the web app: `express, mongodb, body-parser`. 
- In addition, these Node.js extensions needed to develop & test: `mocha, chai, request`. 
- All these extensions are captured in package.json and installed by `npm install` when the web container starts up.

Future Extensions
-----------------

- API and data model can be extended to include the notion of users e.g. <host>/msg to <host>/user/msg, and a storing a user field in each message document.
- To evolve to a more complex model, [Mongoose ODM](mongoosejs.com) can be used to model and validate the schemas.
 
