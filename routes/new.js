const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Lobby = require('../models/lobby');

const code_length = 4;

/* GET new page. */
router.get('/', function(req, res) {
  res.render('new', { title: 'New Game', errors: req.session.errors });
  req.session.errors = null;
});

async function generate_code(callback) {
    var code = null;
    do {
        var result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (var i = 0; i < code_length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        await Lobby.findOne({"code": code}).then(function (existingLobby) {
            if (!existingLobby) {
                code = result;
            }
        });
    } while (code == null);
    callback(code);
}

router.post('/', [check('name', 'Invalid Name').isLength({min: 2})],
    async function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.errors = errors.array();
            res.redirect('/new');
        } else {
            const settings = {
                guinevere: req.body.guinevere == 'on',
                puck: req.body.puck == 'on',
                robin: req.body.robin == 'on',
                jester: req.body.jester == 'on',
                leon: req.body.leon == 'on',
                galahad: req.body.galahad == 'on',
                lucius: req.body.lucius == 'on',
                assassin: req.body.assassin
            };

            const name = req.body.name

            generate_code(function(code) {
                const newLobby = new Lobby({code: code, status: 'OPEN', settings: settings});
                newLobby.save();
                req.session.backURL = '/new';
                res.redirect(`/game?code=${code}&name=${name}`);
            });
        }
    });

module.exports = router;
