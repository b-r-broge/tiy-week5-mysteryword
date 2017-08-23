const express = require('express');
const router = express.Router();
const session = require('express-session');

// build a session
router.use(session({
  secret: 'this is very secret',
  resave: false,
  saveUninitialized: true
}));

router.use(function(req, res, next) {
  // set variables we want to track
  var word = req.session.word;

  // If they aren't part of the cookie yet, set them in the cookie as well.
  if (!word) {
    word = req.session.word = "";
    req.session.wordArr = [];
    req.session.remGuess = {
      guessesRemaining: 8
    };
    req.session.letGuess = [];
    req.session.lowerGuess = [];
    req.session.stillHidden = 100;
  }

  // Build the mustache object to use for rendering
  mstchObj = {
    word: req.session.word,
    wordArr: req.session.wordArr,
    remGuess: req.session.remGuess,
    letGuess: req.session.letGuess,
    lowGuess: req.session.lowerGuess,
    visit: req.session.visit
  }

  // console.log('word:', word);
  // console.log('wordArr:', wordArr);
  // console.log('guessesRemaining:', remGuess);
  // console.log('All letters Guessed:', letGuess);

  next();
});

router.get('/start', function(req, res) {
  console.log('getting user difficulty input');
  res.render('start', {});
});

router.get('/restart', function(req, res) {
  req.session.destroy(function(err) {
    console.log('restarting, destroying session');
    res.redirect('/start');
  });
});

router.get('/mystery', function(req, res) {
  if (!req.session.word) {
    res.redirect('/start');
    return;
  }
  res.render('template', mstchObj);
});

router.get('/victory', function(req, res) {
  res.render('victory', mstchObj);
});

router.get('/defeat', function(req, res) {
  res.render('defeat', mstchObj);
});

module.exports = router;
