// Build a server based game.  The client should send a call whenever info added
// It will need to store new info in the session

// Define dependencies and build variables
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const parseurl = require('parseurl');
const mustache = require('mustache-express');
const fs = require('fs');
const words = fs.readFileSync('/usr/share/dict/words', 'utf-8').toLowerCase().split('\n').filter(function(a) {
  if (a.indexOf('\'') > -1) { return false }
  if (a.length > 2) {
    return true;
  }
  return false;
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('mustache', mustache());
app.set('view engine', 'mustache')
app.set('views', './views')

// build a session
app.use(session({
  secret: 'this is very secret',
  resave: false,
  saveUninitialized: true
}));

app.use('/*', function (req, res, next) {
// set variables we want to track
  var word = req.session.word;
  var wordArr = req.session.wordArr;
  var remGuess = req.session.remGuess;
  var letGuess = req.session.letGuess;

  console.log('word:', word);
  console.log('wordArr:', wordArr);
  console.log('guessesRemaining:', remGuess);
  console.log('All letters Guessed:', letGuess);

// If they aren't part of the cookie yet, set them in the cookie as well.
  if (!word) {
    word = req.session.word = "";
    wordArr = req.session.wordArr = [];
    // wordArr = req.session.wordArr = word.answer.split('').map(function(a) {
    //   return {letter: a, seen: false};
    // });
    remGuess = req.session.remGuess = {guessesRemaining: 8};
    letGuessed = req.session.letGuess = [];
    // letter = req.session.letter = {guess: ""};
  }
// Use parseurl to check which url th0ey are on, and how they should behave
// Don't think I need this yet ^^^


  next();
});

app.get('/mystery', function(req, res) {
  // req.session.visit.num++;
  if (!req.session.word) {
    res.redirect('/start');
    return;
  }

  res.render('template', {word: req.session.word,
                          wordArr: req.session.wordArr,
                          remGuess: req.session.remGuess,
                          letGuess: req.session.letGuess,
                          // letter: req.session.letter,
                          visit: req.session.visit});
});

app.post('/guess', function (req, res) {
  // check if there is a letter that needs to be displayed,
  // then return to the /mystery page
  console.log('guess submitted: session:', req.session);
  console.log('guess submitted:', req.body.nextLetter);
  var notInWord = true
  req.session.letGuess.push(req.body.nextLetter);
  for (word of req.session.wordArr) {
    if (word.letter === req.body.nextLetter) {
      word.seen = true;
      notInWord = false;
    }
  }
  if (notInWord) {
    req.session.remGuess.guessesRemaining--
  }
  res.redirect('/mystery');
});

app.get('/start', function(req, res) {
  console.log('getting user difficulty input');
  res.render('start', {});
});

app.post('/start', function(req, res) {
  console.log('setting difficulty', req.body.difficulty);
  var low = 0;
  var high = 100;
  switch (req.body.difficulty) {
    case "easy":
      low = 4;
      high = 6;
      break;
    case "normal":
      low = 6;
      high = 8;
      break;
    case "hard":
      low = 8;
      high = 10;
      break;
    case "insane":
      low = 10;
      break;
    default:
      console.log('invalid input');
      break;
  }
  var wordList =  words.filter(function(a) {
    if (a.length >= low && a.length <= high) {
      return true;
    } return false;
  });
  var word = wordList[Math.floor(Math.random()*wordList.length)];
  req.session.word = word;
  console.log('req.session.word set:', req.session.word);
  req.session.wordArr = req.session.word.split('').map(function(a) {
    return {letter: a, seen: false};
  });
  console.log('req.session.wordArr:', req.session.wordArr);
  res.redirect('/mystery');
});

app.listen(3000, function () {
  console.log('visit http://localhost:3000/mystery');
})
