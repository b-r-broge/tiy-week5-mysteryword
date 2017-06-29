const express = require('express');
const router = express.Router();
const fs = require('fs');

const words = fs.readFileSync('/usr/share/dict/words', 'utf-8').toUpperCase().split('\n').filter(function(a) {
  if (a.indexOf('\'') > -1) {
    return false
  }
  if (a.length >= 4) {
    return true;
  }
  return false;
});


router.post('/guess', function(req, res) {
  // check if there is a letter that needs to be displayed,
  // then return to the /mystery page
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
  if (req.session.stillHidden === 0) {
    console.log('word guessed');
    res.redirect('/victory');
  } else if (req.session.remGuess.guessesRemaining === 0) {
    console.log('game lost');
    res.redirect('/defeat');
  } else {
    console.log('characters still hidden:', req.session.stillHidden);
    res.redirect('/mystery');
  }
});

router.post('/start', function(req, res) {
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
  console.log('req.session.word set', word);
  req.session.stillHidden = word.length;
  req.session.wordArr = req.session.word.split('').map(function(a) {
    return {
      letter: a,
      seen: false
    };
  });
  res.redirect('/mystery');
});

module.exports = router;
