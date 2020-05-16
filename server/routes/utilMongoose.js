var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var mongoose = require('mongoose')
var userSchema = require('../models/userSchema');
var alumniSchema = require('../models/alumniSchema');

const HASH_COST = 10;

router.get('/getAlumni/', async (req, res, next) => {
    try {
        var dbData = await alumniSchema.findOne({email: req.body.email})
        res.status(200).send({'student' : dbData});
    } catch (e) {
        console.log("Error: util#getStudent", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/allAlumni', async (req, res, next) => {
    try {
        const dbData = await alumniSchema.find()
        res.json({'alumnus' : dbData});
    } catch (e) {
        console.log("Error: util#allStudents", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/addAlumni/', async (req, res, next) => {
    try {

        const email = req.body.email;
        const name = req.body.name;
        const gradYear = parseInt(req.body.gradYear);
        const location = req.body.location;
        const profession = req.body.profession;
        const company = req.body.company;
        const college = req.body.college;
        const availabilities = [];
        const timeZone = req.body.timeZone;
        const zoomLink = req.body.zoomLink;
        const password = req.body.password;

        const role = "ALUMNI"
        const emailVerified = false
        const approved = false
        const verificationToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)
        var alumni_instance = new alumniSchema(
            {
                name: name,
                email: email,
                gradYear: gradYear,
                location: location,
                profession: profession,
                company: company,
                college: college,
                //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
                //posts: [{type: Schema.Types.ObjectId, ref: 'postSchema'}]
                availabilities: availabilities,
                timeZone: timeZone,
                zoomLink: zoomLink
            }
        )
        const user_instance = new userSchema(
            {
              email: email,
              passwordHash: passwordHash,
              verificationToken: verificationToken,
              role: role,
              emailVerified: emailVerified,
              approved: approved
            }
        );
        
        alumni_instance.save(function (err) {
            if (err) return handleError(err);
        });
        user_instance.save(function (err) {
            if (err) return handleError(err);
        });
        res.status(200).send({
            message: 'Successfully added student',
            student: alumni_instance
        });
    } catch (e) {
        res.status(500).send({
            message: 'Failed adding student' + e
        });
    }
});

router.get('/allUsers', async (req, res, next) => {
    try {
        const dbData = await userSchema.find();
        res.status(200).send({'allUsers' : dbData});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

router.get('/data/clear/all', async (req, res, next) => {
    try {
        await alumniSchema.remove({});
        await userSchema.remove({});
        res.status(200).send({'message' : 'deleted all records!'});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

router.get('/data/clear/alumni', async (req, res, next) => {
    try {
        await alumniSchema.remove({});
        res.status(200).send({'message' : 'deleted all student records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

router.get('/data/clear/user', async (req, res, next) => {
    try {
        await userSchema.remove({});
        res.status(200).send({'message' : 'deleted all user records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

module.exports = router;