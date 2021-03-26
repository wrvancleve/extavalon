const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const lobbyCollection = require('../models/lobbyCollection');
const PlayerCollection = require('../models/playerCollection');

const code_length = 4;

/* GET new page. */
router.get('/', function(req, res) {
  let online = false;
  if (req.query.type && req.query.type === 'online') {
    online = true;
  }
  res.render('new', { title: 'New Game', errors: req.session.errors, online: online });
  req.session.errors = null;
});

function generate_code() {
    var code = null;
    do {
        var result = '';
        const characters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
        for (var i = 0; i < code_length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        if (!lobbyCollection.lobbies.has(code)) {
            code = result;
        }
    } while (code === null);
    return code;
}

router.post('/', [check('name', 'Invalid Name').trim().matches("^[ a-zA-z0-9]{2,12}$")], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect(`/new?type=${type}`);
    } else {
        const settings = {
            guinevere: req.body.guinevere === 'on',
            puck: req.body.puck === 'on',
            jester: req.body.jester === 'on',
            leon: req.body.leon === 'on',
            galahad: req.body.galahad === 'on',
            titania: req.body.titania === 'on',
            gawain: req.body.gawain === 'on',
            bedivere: req.body.bedivere === 'on',
            gaheris: req.body.gaheris === 'on',
            gareth: req.body.gareth === 'on',
            kay: req.body.kay === 'on',
            lucius: req.body.lucius === 'on',
            accolon: req.body.accolon === 'on',
            lamorak: req.body.lamorak === 'on',
            claudas: req.body.claudas === 'on'
        };
        //lamorak: req.body.lamorak === 'on',
        //claudas: req.body.claudas === 'on'
        //bors: req.body.bors === 'on',
        //ector: req.body.ector === 'on',

        const type = req.query.type || 'local';
        const name = req.body.name
        const code = generate_code();
        const newLobby = {
            code: code,
            host: req.sessionID,
            type: type,
            settings: settings,
            playerCollection: new PlayerCollection(),
            game: null,
            updateTime: Date.now()
        };
        lobbyCollection.lobbies.set(code, newLobby);
        
        req.session.backURL = `/new?type=${type}`;
        res.redirect(`/game-${type}?code=${code}&name=${name}`);
    }
});

module.exports = router;
