var express = require('express');
var router = express.Router();
var newsSchema = require('../models/newsSchema');
var moment = require('moment');
const alumniSchema = require('../models/alumniSchema');
const studentSchema = require('../models/studentSchema');
require('mongoose').Promise = global.Promise

router.get('/getNews/:role/:id', async (req, res, next) => {
    let role = req.params.role
    let id = req.params.id
    try {
        let dbData;
        if (role == 'ALUMNI') {
            userInfo = await alumniSchema.findById(id)
            dbData = await newsSchema.find({role: {$ne: 'STUDENT'}, school: userInfo.school}).populate('alumni').populate('students')
        } else {
            userInfo = await studentSchema.findById(id)
            dbData = await newsSchema.find({role: {$ne: 'ALUMNI'}, school: userInfo.school, grade: {$in: [null, userInfo.grade]}}).populate('alumni').populate('students')
        }
        for (let item of dbData) {
            item.timeElapsed = moment(item.dateCreated).fromNow();
        }
        res.json({'news' : dbData});
    } catch (e) {
        console.log('getNews error: ' + e)
        res.status(500).send({message: 'getNews error: ' + e})
    }
})

module.exports = router;