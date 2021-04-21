var express = require('express')
var passport = require("passport")
var router = express.Router()
var schoolSchema = require('../models/schoolSchema')
var alumniSchema = require('../models/alumniSchema')
var userSchema = require('../models/userSchema')
var eventSchema = require('../models/eventSchema')
require('mongoose').Promise = global.Promise


/*
    Helper function to ensure user has access to a given school
    @param accessContexts - list of access levels for the given user
    @param userSchool - user school object
    @param school - object of school user is attempting to access
    @return Boolean determining if the user has access to school
*/
const isValidAccessContext = ({ accessContexts, userSchool, school }) => {
    if (accessContexts.includes("GLOBAL")) {
        return true
    } else if (accessContexts.includes("INTERSCHOOL")) {
        return userSchool.country === school.country
    } else {
        return userSchool._id.toString() === school._id.toString()
    }
}

/*
    Helper function to ensure user has access to a given school
    @param accessContexts - list of access levels for the given user
    @param gradYear - user graduation yeat
    @param school - user school
    @return List of events the alumus has access to
*/
const getEventsForAlum = async ({ accessContexts, gradYear, school }) => {
    // find all events based on graduation year
    var events = await eventSchema.find({
      $and: [
        {
          $or: [
            { startYear: null },
            { startYear: { $lte: gradYear }}
          ],
        },
        {
          $or: [
            { endYear: null},
            { endYear: { $gte: gradYear }}
          ]
        },
      ],
    })
    .populate({ path: 'school', select: '_id' })
    .populate({ path: 'school', select: 'country' })

    // return events based on user access contexts
    if (accessContexts.includes("GLOBAL")) {
        return events;
    } else if (accessContexts.includes("INTERSCHOOL")) {
        return events.filter(event => event.school.country === school.country)
    } else {
        return events.filter(event => {
            return event.school._id.toString() === school._id.toString()
        })
    }
}

/*
    API to use
    @return the user created event
*/
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let isAlumni = req.user.role.includes("ALUMNI")
        // event restricted to alumni only
        if (!isAlumni) {
            res.status(403).json({ message: "User must be an alumnus to access event" })
            return
        }
        let userRecord = await userSchema.findById(req.user.id)
        let alumnus = await alumniSchema.findOne({ user: req.user.id })
        let eventSchool = await schoolSchema.findOne(alumnus.school)
        let events = await getEventsForAlum({
            accessContexts: userRecord.accessContexts,
            gradYear: alumnus.gradYear,
            school: eventSchool
        })
        res.status(200).json({ events })
    } catch (error) {
        console.error("Error: events#find", error)
        res.status(500).send({ error })
    }
})


/*
    API used by alumni to create alumni accessible events
    @return the user created event
*/
router.post('/create', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let isAlumni = req?.user?.role?.includes("ALUMNI")
        // event creation restricted to alumni only
        if (!isAlumni) {
            res.status(403).json({
                message: "User must be an alumnus to create event"
            })
            return
        }
        let userRecord = await userSchema.findById(req.user.id)
        let alumnus = await alumniSchema.findOne({ user: req.user.id })
        // school validation
        let inputSchool = null
        let userSchoolId = alumnus.school
        let userSchool = await schoolSchema.findById(userSchoolId)
        if (req.body.startYear && req.body.endYear && req.body.startYear > req.body.endYear) {
            res.status(404).json({
                message: "Event start year must come before end year"
            })
            return
        }
        if (req.body.school) {
            inputSchool = await schoolSchema.findById(req.body.school)
            if (!inputSchool) {
                res.status(404).json({
                    message: `Could not find school with id ${inputSchool.id}`
                })
                return
            } else if (!isValidAccessContext({ accessContexts: userRecord.accessContexts, userSchool, school: inputSchool })) {
                res.status(403).json({
                    message: `User does not have access level to create event in ${inputSchool.country}`
                })
                return
            }            
        }
        if (!(inputSchool || userSchool)) {
            console.error("Error: events#create. Invalid school saved on user object.")
            res.status(404).json({
                message: `Could not find school with id ${userSchoolId}`
            })
            return
        }
        inputSchool = inputSchool || userSchool
        // event body validation
        if (!req.body.title || !req.body.date || !req.body.description) {
            res.status(400).json({
                message: "Event must contain have title, description and date fields provided"
            })
            return
        }
        // event creation
        let event = new eventSchema({
            creator: userRecord._id,
            title: req.body.title,
            date: req.body.date,
            link: req.body.link,
            description: req.body.description,
            school: inputSchool._id,
            years: req.body.years
        })
        await event.save()

        res.status(200)
    } catch (error) {
        console.error("Error: events#create", error)
        res.status(500).send({ error })
    }
})

module.exports = router;
