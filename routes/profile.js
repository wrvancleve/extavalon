const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const postgres = require('../models/database');

/* GET home page. */
router.get('/', authenticate, function(req, res) {
  const gameLogQuery = `select * from extavalon.get_games(${req.cookies.userId})`;
  postgres.query(gameLogQuery, (err, result) => {
    let gameLog = null;
    if (err) {
        console.log(err.stack)
    } else {
      gameLog = result.rows;
    }

    res.render('profile', { title: 'Profile', firstName: req.cookies.firstName, lastName: req.cookies.lastName, gameLog: gameLog });
  });
});

module.exports = router;
