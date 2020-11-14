const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Lobby = require('../models/lobby');

/* GET game page. */
router.get('/', [check('name', 'Invalid Name').trim().matches("^[ a-zA-z]{2,12}$")],
    function(req, res) {
        const redirectURL = req.session.backURL || '/join';
        req.session.backURL = null;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.session.errors = errors.array();
            res.redirect(redirectURL);
        } else {
            const code = req.query.code;

            Lobby.findOne({ "code": code }).then(function(existingLobby) {
                if (existingLobby) {
                    const playerIndex = existingLobby.players.findIndex(player => player.sessionId === req.session.id)
                    const lobbyFull = existingLobby.players.filter(player => player.active === "player-active").length === 10;
                    const host = existingLobby.players.length === 0 || playerIndex === 0;

                    if (lobbyFull) {
                        req.session.errors = [{msg: "Game full!"}]
                        res.redirect(redirectURL);
                    } else {
                        res.render('game', { title: req.query.name, host: host, settings: existingLobby.settings });
                    }
                } else {
                    req.session.errors = [{msg: "Game not found!"}]
                    res.redirect(redirectURL);
                }
            });
        }
});

module.exports = router;