const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const lobbyManager = require('../models/lobbyManager');

/* GET new page. */
router.get('/', function(req, res) {
  let online = false;
  if (req.query.type && req.query.type === 'online') {
    online = true;
  }
  res.render('new', { title: 'New Game', errors: req.session.errors, online: online });
  req.session.errors = null;
});

router.post('/', [check('name', 'Invalid Name').trim().matches("^[ a-zA-z0-9]{2,12}$")], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect(`/new?type=${type}`);
    } else {
        const settings = {
            galahad: req.body.galahad === 'on',
            titania: req.body.titania === 'on',
            bedivere: req.body.bedivere === 'on',
            lucius: req.body.lucius === 'on',
            accolon: req.body.accolon === 'on'
        };

        const type = req.query.type || 'local';
        const name = req.body.name
        const code = lobbyManager.create(req.sessionID, type, settings);
        
        req.session.backURL = `/new?type=${type}`;
        res.redirect(`/game-${type}?code=${code}&name=${name}`);
    }
});

module.exports = router;
