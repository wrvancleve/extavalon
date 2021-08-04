const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { lobbies, generate_code } = require('../models/lobbyCollection');
const PlayerCollection = require('../models/playerCollection');

/* GET game page. */
router.get('/', authenticate, function(req, res) {
    const redirectURL = req.session.backURL || `/?menu=join`;
    const code = req.query.code;
    if (lobbies.has(code)) {
        const lobby = lobbies.get(code);
        console.log(`Connecting Player: ${req.cookies.userId}`);
        const host = lobby.host === req.cookies.userId;
        const lobbyFull = !lobby.playerCollection.doesUserIdExist(req.cookies.userId) && lobby.playerCollection.getPlayerCount() === 10;

        if (lobbyFull) {
            req.session.errors = [{msg: "Game full!"}]
            res.redirect(redirectURL);
        } else {
            if (lobby.type === 'online') {
                res.render('gameOnline', { title: 'Extavalon: Online Game', code: code, host: host, settings: lobby.settings });
            } else {
                res.render('gameLocal', { title: 'Extavalon: Local Game', code: code, host: host, settings: lobby.settings });
            }
        }
    } else {
        req.session.errors = [{msg: "Game not found!"}]
        res.redirect(redirectURL);
    }
});

router.post('/', authenticate, function(req, res) {
    const code = generate_code();
    const type = req.body.type;
    const newLobby = {
        code: code,
        host: req.cookies.userId,
        type: type,
        settings: {
            galahad: req.body.galahad === 'on',
            titania: req.body.titania === 'on',
            bedivere: req.body.bedivere === 'on',
            lucius: req.body.lucius === 'on',
            accolon: req.body.accolon === 'on'
        },
        playerCollection: new PlayerCollection(),
        game: null,
        updateTime: Date.now()
    };
    lobbies.set(code, newLobby);
    console.log(`Set lobby host as ${newLobby.host}`);
    
    req.session.backURL = `/?menu=new-${type}`;
    res.redirect(`/game?code=${code}`);
});

module.exports = router;