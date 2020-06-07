var express = require('express');
var router = express.Router();
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var requestSchema = require('../models/requestSchema');
var timezoneHelpers = require("../helpers/timezoneHelpers")
require('mongoose').Promise = global.Promise

router.get('/', async (req, res, next) => {
    res.status(200).send({
        message: "requests page!"
    })
})

router.patch('/applyRequesterTimezone', async (req, res, next) => {
    try {
        const agnosticAvailabilities = req.body.availabilities;
        const timezone = req.body.offset
        const availabilities = await timezoneHelpers.applyTimezone(agnosticAvailabilities, timezone)
        res.status(200).send({
            availabilities: availabilities
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: ('failed to apply timezone (request/applyRequesterTimezone) Reason: ' + e)
        })
    }
})

router.post('/addRequest', async (req, res, next) => {
    try {
        const requesterId = req.body.requesterId;
        const requesterRole = req.body.requesterRole
        const mentorId = req.body.mentorId;
        const timeId = req.body.timeId;
        const topic = req.body.topic;
        const status = 'Awaiting Confirmation';
        const note = req.body.note;

        // timeSegments = [day, hour]
        timeSegments = timeId.split('-')
        let time = [{
            day: timeSegments[0],
            time: (parseInt(timeSegments[1]))
        }]
        time = timezoneHelpers.stripTimezone(time, parseInt(req.body.timezone))
        var request_instance = new requestSchema(
            {
                requester: requesterId,
                requesterRole: requesterRole,
                mentor: mentorId,
                zoomLink: req.body.zoomLink,
                topic: topic,
                status: status,
                note: note
            }
        )
        request_instance.time.push({
            day: time[0].day,
            time: time[0].time,
            id: time[0].id
        })
        let insert = await request_instance.save();
        res.status(200).send({
            message: 'Successfully added request',
            request: request_instance
        });
    } catch (e) {
        console.log('request/addRequest Error: ' + e)
        res.status(500).send({
            message: 'Failed creating request: ' + e
        });
    }
});

module.exports = router;