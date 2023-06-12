const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { getPlayerId } = require('../models/database');

router.get('/', function (req, res) {
    req.session.userId = undefined;
    req.session.firstName = undefined;
    req.session.lastName = undefined;
    const errors = req.session.errors;
    req.session.errors = null;
    res.render('login', { title: 'Login', errors: errors });
});

router.post('/', function (req, res) {
    check('firstName', 'Invalid First Name').trim().matches("^[ a-zA-z0-9]{2,16}$");
    check('lastName', 'Invalid Last Name').trim().matches("^[ a-zA-z0-9]{2,16}$");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect(`/login`);
    } else {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        getPlayerId(firstName, lastName, (err, result) => {
            if (err) {
                res.redirect(`/login`);
            } else {
                req.session.userId = result;
                req.session.firstName = firstName;
                req.session.lastName = lastName;
                res.redirect(`/`);
            }
        });
    }
});

module.exports = router;
