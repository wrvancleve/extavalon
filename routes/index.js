const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, function(req, res) {
  res.render('index', { title: 'Home', errors: req.session.errors });
  req.session.errors = null;
});

module.exports = router;
