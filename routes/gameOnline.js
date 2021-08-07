const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const lobbyManager = require('../models/lobbyManager');

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
            if (lobbyManager.has(code)) {
                const lobby = lobbyManager.get(code);
                const host = lobby.host === req.sessionID;
                //const lobbyFull = !lobby.playerCollection.doesSocketIdExist() && lobby.playerCollection.getPlayerCount() === 10;
                const lobbyFull = false;

                if (lobbyFull) {
                    req.session.errors = [{msg: "Game full!"}]
                    res.redirect(redirectURL);
                } else {
                    res.render('gameOnline', { title: req.query.name, code: code, host: host, settings: lobby.settings });
                }
            } else {
                req.session.errors = [{msg: "Game not found!"}]
                res.redirect(redirectURL);
            }
        }
});

module.exports = router;