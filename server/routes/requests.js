var express = require('express');
var router = express.Router();
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var requestSchema = require('../models/requestSchema');
require('mongoose').Promise = global.Promise

router.get('/', async (req, res, next) => {
    res.status(200).send({
        message: "requests page!"
    })
})

router.post('/addRequest/', async (req, res, next) => {
    try {
        const student_email = req.body.student_email;
        const alumni_email = req.body.alumni_email;
        const time = req.body.time;
        const topic = req.body.topic;
        const status = 'Awaiting Confirmation';
        const intro = req.body.intro;
        const note = req.body.note;

        var student = await studentSchema.findOne({email: student_email});
        var alumni = await alumniSchema.findOne({email: alumni_email});

        var request_instance = new requestSchema(
            {
                student: student._id,
                alumni: alumni._id,
                time: time,
                zoomLink: alumni.zoomLink,
                topic: topic,
                status: status,
                intro: intro,
                note: note
            }
        )
        
        let insert = await request_instance.save();
        res.status(200).send({
            message: 'Successfully added request',
            request: request_instance
        });
    } catch (e) {
        res.status(500).send({
            message: 'Failed creating request: ' + e
        });
    }
});

module.exports = router;