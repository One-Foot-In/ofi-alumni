var express = require('express');
var passport = require("passport");
var router = express.Router();
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var requestSchema = require('../models/requestSchema');
var newsSchema = require('../models/newsSchema');
var timezoneHelpers = require("../helpers/timezoneHelpers")
var sendNewRequestEmail = require('../routes/helpers/emailHelpers').sendNewRequestEmail
var sendRequestConfirmedEmail = require('../routes/helpers/emailHelpers').sendRequestConfirmedEmail
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
        const studentId = req.body.requesterId;
        const mentorId = req.body.mentorId;
        const timeId = req.body.timeId;
        const topic = req.body.topic;
        const status = 'Awaiting Confirmation';
        const studentNote = req.body.note;

        // timeSegments = [day, hour]
        timeSegments = timeId.split('-')
        let time = [{
            day: timeSegments[0],
            time: (parseInt(timeSegments[1]))
        }]
        time = timezoneHelpers.stripTimezone(time, parseInt(req.body.timezone))
        var request_instance = new requestSchema(
            {
                student: studentId,
                mentor: mentorId,
                zoomLink: req.body.zoomLink,
                topic: topic,
                status: status,
                studentNote: studentNote
            }
        )
        request_instance.time.push({
            day: time[0].day,
            time: time[0].time,
            id: time[0].id
        })
        let insert = await request_instance.save();
        let mentor = await alumniSchema.findOne({_id: mentorId}, {email: 1})
        await sendNewRequestEmail(mentor.email)
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
        if (newStatus === 'Confirmed') {
            let mentee = await studentSchema.findOne({_id: request.student})
            let mentor = await alumniSchema.findOne({_id: alumniId})
            let menteeTime = timezoneHelpers.applyTimezone(request.time, mentee.timeZone)
            let menteeTimeString = `${menteeTime[0].day} ${timezoneHelpers.getSlot(menteeTime[0].time)}`
            // javascript directory mutates time object, so we need to strip timezone here before using time again again
            timezoneHelpers.stripTimezone(request.time, mentee.timeZone)
            let mentorTime = timezoneHelpers.applyTimezone(request.time, mentor.timeZone)
            let mentorTimeString = `${mentorTime[0].day} ${timezoneHelpers.getSlot(mentorTime[0].time)}`
            let studentsSubscribed = [], alumniSubscribed = []
            alumniSubscribed = [mentor._id]
            studentsSubscribed = [mentee._id]
            grade = mentee.grade
            role = 'BOTH'
            let news_instance = new newsSchema({
                event: 'Confirmed Meeting',
                alumni: alumniSubscribed,
                students: studentsSubscribed,
                // it will be possible to make requests in OFI CORE across school networks
                // we will need to make school an array to accommodate that case
                school: mentor.school,
                role: role,
                grade: grade,
                supportData: {
                    topic: request.topic
                }
            })
            await news_instance.save();

            await sendRequestConfirmedEmail(
                mentee.email,
                mentee.name, 
                menteeTimeString,
                mentor.email,
                mentor.name,
                mentorTimeString,
                request.topic
            )
        }
        for (let status of conditions) {
            const dbData = await requestSchema.find({mentor: alumniId, status: status}).populate('student')
            for (let request of dbData) {
                request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
                request.privateFeedback = undefined;
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

router.patch('/leaveFinalNote/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req,res, next) => {
    let alumniId = req.params.id;
    let timeOffset = req.params.timeOffset;
    let requestId = req.body.requestId;
    let finalNote = req.body.finalNote;
    let conditions = ['Awaiting Confirmation', 'Confirmed', 'Completed']
    let requests = []
    try {
        let request = await requestSchema.findById(requestId);
        request.finalNote = finalNote
        await request.save()
        for (let status of conditions) {
            const dbData = await requestSchema.find({mentor: alumniId, status: status}).populate('student')
            for (let request of dbData) {
                request.time = timezoneHelpers.applyTimezone(request.time, timeOffset)
                request.privateFeedback = undefined;
            }
            requests.push(dbData)
        }
        res.json({'requests' : requests});
    } catch (e) {
        console.log('/request/leaveFinalNote Error: ' + e)
        res.status(500).send({
            message: 'Failed to add final note: ' + e
        })
    }
})

router.patch('/leaveAlumniNote/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req,res, next) => {
    let alumniId = req.params.id;
    let timeOffset = req.params.timeOffset;
    let requestId = req.body.requestId;
    let alumniNote = req.body.alumniNote;
    let conditions = ['Awaiting Confirmation', 'Confirmed', 'Completed']
    let requests = []
    try {
        let request = await requestSchema.findById(requestId);
        request.alumniNote = alumniNote
        await request.save()
        for (let status of conditions) {
            const dbData = await requestSchema.find({mentor: alumniId, status: status}).populate('student')
            for (let request of dbData) {
                request.time = timezoneHelpers.applyTimezone(request.time, timeOffset)
                request.privateFeedback = undefined;
            }
            requests.push(dbData)
        }
        res.json({'requests' : requests});
    } catch (e) {
        console.log('/request/leaveAlumniNote Error: ' + e)
        res.status(500).send({
            message: 'Failed to add alumni note: ' + e
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
            const dbData = await requestSchema.find({mentor: alumniId, status: status}).populate('student')
            for (let request of dbData) {
                request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
                request.privateFeedback = undefined;
            }
            requests.push(dbData)
        }
        res.json({'requests' : requests});
    } catch (e) {
        console.log('getRequests error: ' + e)
        res.status(500).send({message: 'getRequests error: ' + e})
    }
})

router.get('/getSchedulings/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let studentId = req.params.id;
    let timeOffset = parseInt(req.params.timeOffset);
    let conditions = ['Awaiting Confirmation', 'Confirmed', 'Completed']
    let schedulings = []
    try {
        for (let status of conditions) {
            const dbData = await requestSchema.find({
                    student: studentId,
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

router.patch('/updateScheduling/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let studentId = req.params.id;
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
                    student: studentId,
                    status: status
                }).populate('mentor')
            for (let request of dbData) {
                request.time = timezoneHelpers.applyTimezone(request.time, timeOffset)
            }
            schedulings.push(dbData)
        }
        res.json({'schedulings' : schedulings});
    } catch (e) {
        console.log('updateScheduling error: ' + e)
        res.status(500).send({message: 'updateScheduling error: ' + e})
    }
})

router.patch('/leaveFeedback/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let studentId = req.params.id;
    let timeOffset = parseInt(req.params.timeOffset);
    let requestId = req.body.requestId;
    let publicFeedback = req.body.publicFeedback;
    let privateFeedback = req.body.privateFeedback;
    let testimonial = req.body.testimonial
    let conditions = ['Awaiting Confirmation', 'Confirmed', 'Completed']
    let schedulings = []
    try {
        let updatedScheduling = await requestSchema.findById(requestId)
        updatedScheduling.publicFeedback = publicFeedback;
        updatedScheduling.privateFeedback = privateFeedback;
        updatedScheduling.testimonial = testimonial;
        await updatedScheduling.save()
        for (let status of conditions) {
            const dbData = await requestSchema.find({
                    student: studentId,
                    status: status
                }).populate('mentor')
            for (let request of dbData) {
                request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
            }
            schedulings.push(dbData)
        }
        res.json({'schedulings' : schedulings});
    } catch (e) {
        console.log('leaveFeedback error: ' + e)
        res.status(500).send({message: 'leaveFeedback error: ' + e})
    }
})


router.get('/getConfirmed/:id/:timeOffset', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let alumniId = req.params.id;
    let timeOffset = parseInt(req.params.timeOffset)
    try {
        const dbData = await requestSchema.find({mentor: alumniId, status: 'Confirmed'})
        for (let request of dbData) {
            request.time = await timezoneHelpers.applyTimezone(request.time, timeOffset)
            request.privateFeedback = undefined;
        }
        res.json({'confirmed' : dbData});
    } catch (e) {
        console.log('getConfirmed error: ' + e)
        res.status(500).send({message: 'getConfirmed error: ' + e})
    }
})

module.exports = router;
