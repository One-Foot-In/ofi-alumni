var express = require('express');
var passport = require("passport");
var router = express.Router();

var collegeRepSchema = require('../models/collegeRepSchema');

require('mongoose').Promise = global.Promise


router.get('/one/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const dbData = await collegeRepSchema.findOne({_id: req.params.id})
        res.json({'result' : dbData});
    } catch (e) {
        console.log("Error: #oneCollegeRep", e);
        res.status(500).send({'error' : e});
    }
});

module.exports = router;