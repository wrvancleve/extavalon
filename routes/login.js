const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const postgres = require('../models/database');

/* GET home page. */
router.get('/', function(req, res) {
    res.cookie('userId', {expires: Date.now()});
    res.cookie('firstName', {expires: Date.now()});
    res.cookie('lastName', {expires: Date.now()});
    res.render('login', { title: 'Login', errors: req.session.errors });
    req.session.errors = null;
});

router.post('/', function(req, res) {
    check('firstName', 'Invalid First Name').trim().matches("^[ a-zA-z0-9]{2,16}$");
    check('lastName', 'Invalid Last Name').trim().matches("^[ a-zA-z0-9]{2,16}$");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect(`/login`);
    } else {
        console.log("Getting id...");
        getPlayerId(req.body.firstName, req.body.lastName, (err, result) => {
            if (err) {
                res.redirect(`/login`);
            } else {
                console.log(`Id returned from getPlayerId: ${result}`);
                res.cookie('userId', result);
                res.cookie('firstName', req.body.firstName);
                res.cookie('lastName', req.body.lastName);
                res.redirect(`/`);
            }
        });
    }
});

function getPlayerId(firstName, lastName, callback) {
    const query = `select extavalon.get_player_id('${firstName}', '${lastName}') as player_id`;
    postgres.query(query, (err, result) => {
        if (err) {
            console.log(err.stack)
            callback(err, null);
        } else {
            console.log(`Id returned from query: ${result.rows[0].player_id}`);
            callback(null, result.rows[0].player_id);
        }
    });
}

module.exports = router;
