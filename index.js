// Build a server based game.  The client should send a call whenever info added
// It will need to store new info in the session

// Define dependencies and build variables
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const parseurl = require('parseurl');
const mustache = require('mustache-express');
const fs = require('fs');
const words = fs.readFileSync('/usr/share/dict/words', 'utf-8').toUpperCase().split('\n').filter(function(a) {
  if (a.indexOf('\'') > -1) {
    return false
  }
  if (a.length > 2) {
    return true;
  }
  return false;
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.engine('mustache', mustache());
app.set('view engine', 'mustache')
app.set('views', './views')

// build a session
app.use(session({
  secret: 'this is very secret',
  resave: false,
  saveUninitialized: true
}));

app.use('/*', function(req, res, next) {
  // set variables we want to track
  var word = req.session.word;
  var wordArr = req.session.wordArr;
  var remGuess = req.session.remGuess;
  var letGuess = req.session.letGuess;
  var lowGuess = req.session.lowerGuess;
  var stillHidden = req.session.stillHidden;

  // console.log('word:', word);
  // console.log('wordArr:', wordArr);
  // console.log('guessesRemaining:', remGuess);
  // console.log('All letters Guessed:', letGuess);

  // If they aren't part of the cookie yet, set them in the cookie as well.
  if (!word) {
    word = req.session.word = "";
    wordArr = req.session.wordArr = [];
    remGuess = req.session.remGuess = {
      guessesRemaining: 8
    };
    letGuessed = req.session.letGuess = [];
    lowGuess = req.session.lowerGuess = [];
    stillHidden = req.session.stillHidden = 100;
  }

  next();
});

app.get('/mystery', function(req, res) {
  // req.session.visit.num++;
  if (!req.session.word) {
    res.redirect('/start');
    return;
  }

  res.render('template', {
    word: req.session.word,
    wordArr: req.session.wordArr,
    remGuess: req.session.remGuess,
    letGuess: req.session.letGuess,
    lowGuess: req.session.lowerGuess,
    visit: req.session.visit
  });
});
 
app.post('/guess', function(req, res) {
  // check if there is a letter that needs to be displayed,
  // then return to the /mystery page
  // console.log('guess submitted: session:', req.session);
  // console.log('guess submitted:', req.body.nextLetter);
  var guess = req.body.nextLetter.toUpperCase();
  console.log('guess submitted:', guess);
  var notInWord = true
  req.session.letGuess.push(guess);
  req.session.lowerGuess.push(guess.toLowerCase())
  for (word of req.session.wordArr) {
    if (word.letter === guess) {
      word.seen = true;
      notInWord = false;
      req.session.stillHidden--
    }
  }
  if (notInWord) {
    req.session.remGuess.guessesRemaining--
  }
  console.log('characters still hidden:', req.session.stillHidden);
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
  var wordList = words.filter(function(a) {
    if (a.length >= low && a.length <= high) {
      return true;
    }
    return false;
  });
  var word = wordList[Math.floor(Math.random() * wordList.length)];
  req.session.word = word;
  console.log('req.session.word set');
  req.session.stillHidden = word.length;
  req.session.wordArr = req.session.word.split('').map(function(a) {
    return {
      letter: a,
      seen: false
    };
  });
  console.log('req.session.wordArr set');
  res.redirect('/mystery');
});

// TODO: Add a /mystery/victory and a /mystery/defeat page
// On both pages, reveal the word (and show missed characters),
// and have a restart link to the /start page.

app.listen(3000, function() {
  console.log('visit http://localhost:3000/mystery');
})
