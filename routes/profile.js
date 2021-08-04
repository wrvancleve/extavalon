const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

/* GET home page. */
router.get('/', authenticate, function(req, res) {
  res.render('profile', { title: 'Profile', firstName: req.cookies.firstName, lastName: req.cookies.lastName });
});

module.exports = router;
