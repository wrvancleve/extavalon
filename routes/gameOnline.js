const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const lobbyCollection = require('../models/lobbyCollection');

/* GET game page. */
router.get('/', [check('name', 'Invalid Name').trim().matches("^[ a-zA-z0-9]{2,12}$")],
    function(req, res) {
        const redirectURL = req.session.backURL || '/join';
        req.session.backURL = null;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.session.errors = errors.array();
            res.redirect(redirectURL);
        } else {
            const code = req.query.code;
            if (lobbyCollection.lobbies.has(code)) {
                const lobby = lobbyCollection.lobbies.get(code);
                //const playerIndex = lobby.players.findIndex(player => player.sessionId === req.session.id)
                const lobbyFull = lobby.players.filter(player => player.active).length === 10;
                //const host = lobby.players.length === 0 || playerIndex === 0;
                const host = lobby.players.length === 0;

                if (lobbyFull) {
                    req.session.errors = [{msg: "Game full!"}]
                    res.redirect(redirectURL);
                } else {
                    res.render('gameOnline', { title: req.query.name, host: host, settings: lobby.settings });
                }
            } else {
                req.session.errors = [{msg: "Game not found!"}]
                res.redirect(redirectURL);
            }
        }
});

module.exports = router;