'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT * FROM tweets JOIN users ON tweets.user_id = users.id', function (err, data) {
      if (err) return next(err); // pass errors to Express
      res.render('index', { title: 'Twitter.js', tweets: data.rows, showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT * FROM tweets JOIN users ON tweets.user_id = users.id WHERE users.name = $1', [req.params.username], function (err, data) {
      if (err) return next(err);
      console.log(data.rows);
      res.render('index', {
        title: 'Twitter.js',
        tweets: data.rows,
        showForm: true
      });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT * FROM tweets JOIN users ON tweets.user_id = users.id WHERE tweets.id = $1', [req.params.id], function (err, data) {
      if (err) return next(err);
      res.render('index', {
        title: 'Twitter.js',
        tweets: data.rows // an array of only one element ;-)
      });
    });
  });

  function setNewUser(name) {
    client.query('INSERT INTO users (name) VALUES ($1)', [name], function (err, data) {
      if (err) return next(err);
      console.log(data);
      client.query('SELECT id FROM users WHERE name = $1', [name], function (err, data) {
        if (err) return next(err);
        console.log(data);

        return data.rows[0].id;
      });
    });
  }

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function (err, data) {
      if (err) return next(err);
      let userID;

      if (!data.rows.length) {
        userID = setNewUser(req.body.name);
      }
      else {
        userID = data.rows[0].id;
      }
      client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [userID, req.body.content], function (err, data) {
        if (err) return next(err);
        io.sockets.emit('new_tweet', data.rows);
        res.redirect('/');
      });
    });
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
