var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var userSchema = require('../models/userSchema');
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
require('mongoose').Promise = global.Promise

const HASH_COST = 10;

/* Alumni Routes */

router.get('/alumni/', async (req, res, next) => {
    try {
        var dbData = await alumniSchema.findOne({email: req.body.email})
        res.status(200).send({'alumni' : dbData});
    } catch (e) {
        console.log("Error: util#getAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/allAlumni', async (req, res, next) => {
    try {
        const dbData = await alumniSchema.find()
        res.json({'alumnus' : dbData});
    } catch (e) {
        console.log("Error: util#allAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/addAlumni/', async (req, res, next) => {
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
        
        let insert = await alumni_instance.save();
        await user_instance.save();
        res.status(200).send({
            message: 'Successfully added alumni',
            student: alumni_instance
        });
    } catch (e) {
        res.status(500).send({
            message: 'Failed adding alumni: ' + e
        });
    }
});

router.get('/data/clear/alumni', async (req, res, next) => {
    try {
        await alumniSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all alumni records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

/* Student Routes */

router.get('/student/', async (req, res, next) => {
    try {
        var dbData = await studentSchema.findOne({email: req.body.email})
        res.status(200).send({'student' : dbData});
    } catch (e) {
        console.log("Error: util#getStudent", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/allStudent', async (req, res, next) => {
    try {
        const dbData = await studentSchema.find()
        res.json({'students' : dbData});
    } catch (e) {
        console.log("Error: util#allStudent", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/addStudent/', async (req, res, next) => {
    try {

        const email = req.body.email;
        const name = req.body.name;
        const grade = parseInt(req.body.grade);
        const timeZone = req.body.timeZone;
        const password = req.body.password;

        const role = "STUDENT"
        const emailVerified = false
        const approved = false
        const verificationToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)
        var student_instance = new studentSchema(
            {
                name: name,
                email: email,
                grade: grade,
                //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
                //issuesLiked: [{type: Schema.Types.ObjectId, ref: 'issueSchema'}]
                timeZone: timeZone
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
        
        let insert = await student_instance.save();
        await user_instance.save();
        res.status(200).send({
            message: 'Successfully added student',
            student: student_instance
        });
    } catch (e) {
        res.status(500).send({
            message: 'Failed adding student: ' + e
        });
    }
});

router.get('/data/clear/student', async (req, res, next) => {
    try {
        await studentSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all student records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

/* User Routes */
router.get('/allUsers', async (req, res, next) => {
    try {
        const dbData = await userSchema.find();
        res.status(200).send({'allUsers' : dbData});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

router.get('/data/clear/user', async (req, res, next) => {
    try {
        await userSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all user records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

/* Clear All */
router.get('/data/clear/all', async (req, res, next) => {
    try {
        await alumniSchema.deleteMany({});
        await studentSchema.deleteMany({});
        await userSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all records!'});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

module.exports = router;