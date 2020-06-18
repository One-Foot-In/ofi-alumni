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

router.patch('/applyRequesterTimezone', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
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

router.post('/addRequest', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
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

router.patch('/updateRequest/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req,res, next) => {
    let alumniId = req.params.id;
    let timeOffset = parseInt(req.params.timeOffset);
    let requestId = req.body.requestId;
    let newStatus = req.body.newStatus;
    let conditions = ['Awaiting Confirmation', 'Confirmed', 'Completed']
    let requests = []
    try {
        let request = await requestSchema.findById(requestId);
        request.status = newStatus
        await request.save()
        for (let status of conditions) {
            const dbData = await requestSchema.find({mentor: alumniId, status: status})
            for (let request of dbData) {
                request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
                if (request.requesterRole === 'STUDENT') {
                    request.requesterObj = await studentSchema.findOne({_id: request.requester})
                } else {
                    request.requesterObj = await alumniSchema.findOne({_id: request.requester})
                }
            }
            requests.push(dbData)
        }
        res.json({'requests' : requests});
    } catch (e) {
        console.log('/request/updateStatus Error: ' + e)
        res.status(500).send({
            message: 'Failed to update status: ' + e
        })
    }
})

router.get('/getRequests/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let alumniId = req.params.id;
    let timeOffset = parseInt(req.params.timeOffset)
    let conditions = ['Awaiting Confirmation', 'Confirmed', 'Completed']
    let requests = []
    try {
        for (let status of conditions) {
            const dbData = await requestSchema.find({mentor: alumniId, status: status})
            for (let request of dbData) {
                request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
                if (request.requesterRole === 'STUDENT') {
                    request.requesterObj = await studentSchema.findOne({_id: request.requester})
                } else {
                    request.requesterObj = await alumniSchema.findOne({_id: request.requester})
                }
            }
            requests.push(dbData)
        }
        res.json({'requests' : requests});
    } catch (e) {
        console.log('getRequests error: ' + e)
        res.status(500).send({message: 'getRequests error: ' + e})
    }
})

router.get('/getSchedulings/:id/:role/:timeOffset', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let requesterId = req.params.id;
    let requesterRole = req.params.role;
    let timeOffset = parseInt(req.params.timeOffset);
    let conditions = ['Awaiting Confirmation', 'Confirmed', 'Completed']
    let schedulings = []
    try {
        for (let status of conditions) {
            const dbData = await requestSchema.find({
                    requester: requesterId,
                    requesterRole: requesterRole,
                    status: status
                }).populate('mentor')
            for (let request of dbData) {
                request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
            }
            schedulings.push(dbData)
        }
        res.json({'schedulings' : schedulings});
    } catch (e) {
        console.log('getSchedulings error: ' + e)
        res.status(500).send({message: 'getSchedulings error: ' + e})
    }
})

router.patch('/updateScheduling/:id/:role/:timeOffset', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let requesterId = req.params.id;
    let requesterRole = req.params.role;
    let timeOffset = parseInt(req.params.timeOffset);
    let requestId = req.body.requestId;
    let newStatus = req.body.newStatus;
    let conditions = ['Awaiting Confirmation', 'Confirmed', 'Completed']
    let schedulings = []
    try {
        let updatedScheduling = await requestSchema.findById(requestId)
        updatedScheduling.status = newStatus
        await updatedScheduling.save()
        for (let status of conditions) {
            const dbData = await requestSchema.find({
                    requester: requesterId,
                    requesterRole: requesterRole,
                    status: status
                }).populate('mentor')
            for (let request of dbData) {
                request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
            }
            schedulings.push(dbData)
        }
        res.json({'schedulings' : schedulings});
    } catch (e) {
        console.log('updateScheduling error: ' + e)
        res.status(500).send({message: 'updateScheduling error: ' + e})
    }
})

router.get('/getConfirmed/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let alumniId = req.params.id;
    let timeOffset = parseInt(req.params.timeOffset)
    try {
        const dbData = await requestSchema.find({mentor: alumniId, status: 'Confirmed'})
        for (let request of dbData) {
            request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
        }
        res.json({'confirmed' : dbData});
    } catch (e) {
        console.log('getConfirmed error: ' + e)
        res.status(500).send({message: 'getConfirmed error: ' + e})
    }
})

module.exports = router;
