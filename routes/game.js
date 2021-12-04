const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const lobbyManager = require('../models/lobbyManager');

router.get('/', authenticate, function (req, res) {
    const code = req.query.code;
    res.cookie('lastGameCode', code);
    req.session.backURL = '/?menu=join';

    if (lobbyManager.has(code)) {
        const lobby = lobbyManager.get(code);
        const host = lobby.host === req.cookies.userId;
        const lobbyFull = !lobby.playerCollection.doesUserIdExist(req.cookies.userId) && lobby.playerCollection.getPlayerCount() === 10;

        if (lobbyFull) {
            req.session.errors = [{ msg: "Game full!" }]
            res.redirect(req.session.backURL);
        } else {
            res.render('game', { title: 'Extavalon', code: code, host: host, settings: lobby.settings });
        }
    } else {
        req.session.errors = [{ msg: "Game not found!" }]
        res.redirect(req.session.backURL);
    }
});

router.post('/', authenticate, function (req, res) {
    const settings = {
        galahad: req.body.galahad === 'on',
        titania: req.body.titania === 'on',
        bedivere: req.body.bedivere === 'on',
        lucius: req.body.lucius === 'on',
        accolon: req.body.accolon === 'on',
        mordred: req.body.mordred === 'on'
    };
    const code = lobbyManager.create(req.cookies.userId, settings);

    res.redirect(`/game?code=${code}`);
});

module.exports = router;