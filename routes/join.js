const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const lobbyCollection = require('../models/lobbyCollection');

/* GET join page. */
router.get('/', function(req, res) {
  res.render('join', { title: 'Join Game', errors: req.session.errors });
  req.session.errors = null;
});

router.post('/', [check('name', 'Invalid Name').trim().matches("^[ a-zA-z0-9]{2,12}$")], function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      req.session.errors = errors.array();
      res.redirect(`/join`);
  } else {
      const code = req.body.code;
      const name = req.body.name;

      if (!lobbyCollection.lobbies.has(code)) {
        req.session.errors = [{msg: "Game not found!"}];
        res.redirect(`/join`);
      } else {
        const lobby = lobbyCollection.lobbies.get(code);
        req.session.backURL = `/join`;
        res.redirect(`/game-${lobby.type}?code=${code}&name=${name}`);
      }
  }
});

module.exports = router;
