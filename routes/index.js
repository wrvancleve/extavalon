const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const lobbyManager = require('../models/lobbyManager');

router.get('/', authenticate, function (req, res) {
  const lastGameCode = req.cookies.lastGameCode;
  const errors = req.session.errors;

  if (!errors && !lobbyManager.has(lastGameCode)) {
    res.clearCookie("lastGameCode");
  }
  req.session.errors = null;
  res.render('index', { title: 'Home', errors: errors });
});

module.exports = router;
