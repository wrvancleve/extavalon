const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getTeamStats,
  getRoleStats,
  getRoleAssassinationStats,
  getTeamPlayerStats,
  getRolePlayerStats,
  getPlayerAssassinationStats,
  getPlayerAssassinatedStats
} = require('../models/database');

router.get('/', authenticate, function(req, res) {
  res.render('stats', {title: 'Stats'});
});

router.post('/team', function(req, res) {
  getTeamStats((teamStats) => {
    res.send(teamStats);
  });
});

router.post('/role', function(req, res) {
  getRoleStats((roleStats) => {
    res.send(roleStats);
  });
});

router.post('/role-assassinations', function(req, res) {
  getRoleAssassinationStats((roleAssassinationStats) => {
    res.send(roleAssassinationStats);
  });
});

router.post('/team-player', function(req, res) {
  getTeamPlayerStats(req.body.team, (teamPlayerStats) => {
    res.send(teamPlayerStats);
  });
});

router.post('/role-player', function(req, res) {
  getRolePlayerStats(req.body.role, (rolePlayerStats) => {
    res.send(rolePlayerStats);
  });
});

router.post('/player-assassination', function(req, res) {
  getPlayerAssassinationStats((playerAssassinationStats) => {
    res.send(playerAssassinationStats);
  });
});

router.post('/player-assassinated', function(req, res) {
  getPlayerAssassinatedStats((playerAssassinatedStats) => {
    res.send(playerAssassinatedStats);
  });
});



module.exports = router;
