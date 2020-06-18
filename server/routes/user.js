var express = require('express');
var router = express.Router();
var userSchema = require('../models/userSchema');
require('mongoose').Promise = global.Promise

router.get('/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const dbData = await userSchema.findOne({_id: req.params.id})
        res.json({'result' : dbData});
    } catch (e) {
        console.log("Error: util#oneUser", e);
        res.status(500).send({'error' : e});
    }
});

module.exports = router;
