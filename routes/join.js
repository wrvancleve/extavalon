const express = require('express');
const router = express.Router();

/* GET join page. */
router.get('/', function(req, res) {
  res.render('join', { title: 'Join Game', errors: req.session.errors });
  req.session.errors = null;
});

module.exports = router;
