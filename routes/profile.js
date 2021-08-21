const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getGameLog } = require('../models/database');

router.get('/', authenticate, function(req, res) {
  getGameLog(req.cookies.userId, (gameLog) => {
    res.render('profile', { title: 'Profile', firstName: req.cookies.firstName, lastName: req.cookies.lastName, gameLog: gameLog });
  });
});

module.exports = router;
