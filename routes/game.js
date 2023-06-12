const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const lobbyManager = require('../models/lobbyManager');

router.get('/', authenticate, function (req, res) {
    const code = req.query.code;
    req.session.backURL = '/?menu=join';

    if (lobbyManager.has(code)) {
        const lobby = lobbyManager.get(code);
        const host = lobby.host === req.session.userId;
        const lobbyFull = !lobby.playerCollection.doesUserIdExist(req.session.userId) && lobby.playerCollection.getPlayerCount() === 10;

        if (lobbyFull) {
            req.session.errors = [{ msg: "Game full!" }]
            res.redirect(req.session.backURL);
        } else {
            if (lobby.type === 'online') {
                res.render('gameOnline', { title: 'Extavalon: Online Game', code: code, host: host, settings: lobby.settings });
            } else {
                res.render('gameLocal', { title: 'Extavalon: Local Game', code: code, host: host, settings: lobby.settings });
            }
        }
    } else {
        req.session.errors = [{ msg: "Game not found!" }]
        res.redirect(req.session.backURL);
    }
});

router.post('/', authenticate, function (req, res) {
    const type = req.body.type;
    const settings = {
        ector: req.body.ector === "on",
        kay: req.body.kay === "on",
        titania: req.body.titania === "on",
        accolon: req.body.accolon === "on",
        bors: req.body.bors === "on",
        lamorak: req.body.lamorak === "on",
        gaheris: type === 'online' && req.body.resistancebind === "on",
        geraint: type === 'online' && req.body.spybind === "on",
        cynric: type === 'online' && req.body.resistancebind === "on",
        cerdic: type === 'online' && req.body.spybind === "on",
        sirrobin: type === 'online' && req.body.sirrobin === "on"
    };
    const code = lobbyManager.create(req.session.userId, type, settings);
    res.redirect(`/game?code=${code}`);
});

module.exports = router;