// Build a server based game.  The client should send a call whenever info added
// It will need to store new info in the session

// Define dependencies and build variables
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const parseurl = require('parseurl');
const handlebars = require('handlebars');
const fs = require('fs');
const words = fs.readFileSync('/usr/share/dict/words', 'utf-8').toLowerCase().split('\n');

const app = express();

// build a session
app.use(session({
  secret: 'this is very secret',
  resave: false,
  saveUninitialized: true
}));

// app.use(function (req, res, next) {
//   var views = req.session.views
// 
//   if (!views) {
//     views = req.session.views = {}
//   }
//
//   // get the url pathname
//   var pathname = parseurl(req).pathname
//
//   // count the views
//   views[pathname] = (views[pathname] || 0) + 1
//
//   next()
// })
//
// app.get('/foo', function (req, res, next) {
//   res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
// })
//
// app.get('/bar', function (req, res, next) {
//   res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
// })
