const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getGameLog } = require('../models/database');

router.get('/', authenticate, function(req, res) {
  getGameLog(req.session.userId, (gameLog) => {
    res.render('profile', { title: 'Profile', firstName: req.session.firstName, lastName: req.session.lastName, gameLog: gameLog });
  });
});

module.exports = router;
