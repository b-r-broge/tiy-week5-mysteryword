const models = require('./models');
const express = require('express');
const router = express.Router();

const victors = models.leaderboard;

router.post('/champion', function(req, res) {
  const points = req.session.word.length + req.session.remGuess.guessesRemaining;
  console.log('victor:', req.body.name);
  console.log('points:', points)
  victors.findOne({
    where: {
      name: req.body.name.toUpperCase()
    }
  }).then(function(inTable) {
    if (inTable) {
      console.log('name already in table, adding to points');
      console.log('existing points:', inTable.dataValues.points);
      console.log('new points:', points);
      victors.update({
        points: inTable.dataValues.points + points
      }, {
        where: {
          name: req.body.name.toUpperCase()
        }
      }).then(function(updated) {
        console.log('updated points');
        res.redirect('/champion')
      })
    } else {
      console.log('name not in table, adding new name');
      const newName = victors.build({
        name: req.body.name.toUpperCase(),
        points: points
      });
      newName.save().then(function(newAdd) {
        console.log('new name added');
        res.redirect('/champion');
      });
    }
  });
});

router.get('/champion', function(req, res) {
  victors.findAll({
    order: [
      ['points', 'DESC']
    ]
  }).then(function(victorList) {
    console.log('rendering champion page')
    res.render('champion', {
      victors: victorList
    });
  }).catch(function(things) {
   console.log('error');
 });
});

module.exports = router;
