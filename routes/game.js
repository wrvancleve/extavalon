const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Lobby = require('../models/lobby');

/* GET game page. */
router.get('/', [check('name', 'Invalid Name').isLength({min: 2})],
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
                    const playerIndex = existingLobby.players.findIndex(player => player.sessionId == req.session.id)
                    const newConnection = playerIndex == -1;
                    const gameStarted = existingLobby.status === "STARTED";
                    const lobbyFull = existingLobby.players.length === 10;
                    const host = existingLobby.players.length == 0 || playerIndex == 0;

                    if (!newConnection || (!gameStarted && !lobbyFull)) {
                        res.render('game', { title: req.query.name, host: host });
                    } else if (gameStarted) {
                        req.session.errors = [{msg: "Game already started!"}]
                        res.redirect(redirectURL);
                    } else {
                        req.session.errors = [{msg: "Game full!"}]
                        res.redirect(redirectURL);
                    }
                } else {
                    req.session.errors = [{msg: "Game not found!"}]
                    res.redirect(redirectURL);
                }
            });
        }
});

module.exports = router;