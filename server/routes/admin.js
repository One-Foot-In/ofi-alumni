var express = require('express');
var passport = require("passport");
var router = express.Router();
var userSchema = require('../models/userSchema');
var adminSchema = require('../models/adminSchema');
require('mongoose').Promise = global.Promise

router.get('/one/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const dbData = await adminSchema.findOne({_id: req.params.id})
        res.json({'result' : dbData});
    } catch (e) {
        console.log("Error: util#oneAdmin", e);
        res.status(500).send({'error' : e});
    }
});

module.exports = router;