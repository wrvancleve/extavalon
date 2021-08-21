const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { getPlayerId } = require('../models/database');

function titleCase (str) {
    if ((str===null) || (str===''))
         return false;
    else
     str = str.toString();
  
   return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

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
        const firstName = titleCase(req.body.firstName);
        const lastName = titleCase(req.body.lastName);
        getPlayerId(firstName, lastName, (err, result) => {
            if (err) {
                res.redirect(`/login`);
            } else {
                res.cookie('userId', result);
                res.cookie('firstName', firstName);
                res.cookie('lastName', lastName);
                res.redirect(`/`);
            }
        });
    }
});

module.exports = router;
