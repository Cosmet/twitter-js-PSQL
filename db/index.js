const { Client } = require('pg')

var client = new Client({
  database: 'twitterdb',
  host: 'localhost',
  port: 5432,
});

client.connect();

module.exports = client;

// // setting up the node-postgres driver
// var pg = require('pg');
// var postgresUrl = 'postgres://localhost/twitterdb';
// var client = new pg.Client(postgresUrl);

// // connecting to the `postgres` server
// client.connect();

// // make the client available as a Node module
// module.exports = client;
