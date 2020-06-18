var express = require('express');
var router = express.Router();
var newsSchema = require('../models/newsSchema');
require('mongoose').Promise = global.Promise

router.get('/getNews/:role', async (req, res, next) => {
    let role = req.params.role
    try {
        let dbData;
        if (role == 'ALUMNI') {
            dbData = await newsSchema.find({role: {$ne: 'STUDENT'}}).populate('alumni').populate('students')
        } else {
            dbData = await newsSchema.find({role: {$ne: 'ALUMNI'}}).populate('alumni').populate('students')
        }
        res.json({'news' : dbData});
    } catch (e) {
        console.log('getNews error: ' + e)
        res.status(500).send({message: 'getNews error: ' + e})
    }
})

module.exports = router;