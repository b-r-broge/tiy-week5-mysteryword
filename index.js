// Build a server based game.  The client should send a call whenever info added
// It will need to store new info in the session

// Define dependencies and build variables
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const parseurl = require('parseurl');
const mustache = require('mustache-express');
const fs = require('fs');
const words = fs.readFileSync('/usr/share/dict/words', 'utf-8').toLowerCase().split('\n');

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
  var letter = req.session.letter;
  var visit = req.session.visit;

// If they aren't part of the cookie yet, set them in the cookie as well.
  if (!word) {
    word = req.session.word = {answer: words[Math.floor(Math.random()*words.length)]};
    wordArr = req.session.wordArr = word.answer.split('').map(function(a) {
      return {letter: a, seen: false};
    });
    remGuess = req.session.remGuess = {guessesRemaining: 8};
    letGuessed = req.session.letGuess = {guessed: []};
    letter = req.session.letter = {guess: ""};
    visit = req.session.visit = {num: 0};
  }
// Use parseurl to check which url they are on, and how they should behave
// Don't think I need this yet ^^^
 
  console.log('word:', word);
  console.log('wordArr:', wordArr);
  console.log('guessesRemaining:', remGuess);
  console.log('All letters Guessed:', letGuess);
  console.log('current guess:', letter);
  console.log('visits:', visit);

  next();
});

app.get('/mystery', function(req, res) {
  res.render('template', {info: [req.session.word,
                                  req.session.wordArr,
                                  req.session.remGuess,
                                  req.session.letGuessed,
                                  req.session.letter,
                                  req.session.visit]});
});

app.post('/guess', function (req, res) {
  // check if there is a letter that needs to be displayed,
  // then return to the /mystery page
});

app.listen(3000, function () {
  console.log('visit http://localhost:3000/mystery');
})
