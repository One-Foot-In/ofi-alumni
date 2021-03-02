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
    API used by alumni to create alumni accessible events
    @return the user created event
*/
router.post('/create/:userId', async (req, res, next) => {
    try {
        let userRecord = await userSchema.findById(req.params.userId)
        let isAlumni = userRecord.role.includes("ALUMNI")
        // event creation restricted to alumni only
        if (!isAlumni) {
            res.status(403).json({
                message: "User must be an alumnus to create event"
            })
            return
        }
        var alumnus = await alumniSchema.findOne({ user: userRecord._id })
        // school validation
        var school = null
        var userSchoolId = alumnus.school
        var userSchool = await schoolSchema.findById(userSchoolId)
        if (req.body.school) {
            school = await schoolSchema.findById(req.body.school)
            if (!school) {
                res.status(404).json({
                    message: `Could not find school with id ${school.id}`
                })
                return
            } else if (!isValidAccessContext({ accessContexts: userRecord.accessContexts, userSchool, school })) {
                res.status(403).json({
                    message: `User does not have access level to create event in ${school.country}`
                })
                return
            }            
        }
        if (!(school || userSchool)) {
            console.error("Error: events#create. Invalid school saved on user object.")
            res.status(404).json({
                message: `Could not find school with id ${userSchoolId}`
            })
            return
        }
        school = school || userSchool
        // event body validation
        if (!req.body.name || !req.body.date || !req.body.description) {
            res.status(400).json({
                message: "Event must contain have name, description and date fields provided"
            })
            return
        }
        // event creation
        var event = new eventSchema({
            creator: userRecord._id,
            name: req.body.name,
            date: req.body.date,
            link: req.body.link,
            description: req.body.description,
            school: school._id,
            years: req.body.years
        })
        await event.save()

        res.status(200).json({ event })
    } catch (error) {
        console.error("Error: events#create", error)
        res.status(500).send({ error })
    }
})

module.exports = router;

