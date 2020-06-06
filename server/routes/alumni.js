var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var userSchema = require('../models/userSchema');
var alumniSchema = require('../models/alumniSchema');
var collegeSchema = require('../models/collegeSchema');
var jobTitleSchema = require('../models/jobTitleSchema');
var interestsSchema = require('../models/interestsSchema');
var companySchema = require('../models/companySchema');
var schoolSchema = require('../models/schoolSchema');
var timezoneHelpers = require("../helpers/timezoneHelpers")
require('mongoose').Promise = global.Promise

const HASH_COST = 10;

router.post('/', async (req, res, next) => {
    try {
        const email = req.body.email;
        const name = req.body.name;
        const gradYear = parseInt(req.body.graduationYear);
        const country = req.body.country;
        const city = req.body.city;
        const password = req.body.password;
        // TODO: need to add timeZone in frontend request
        const availabilities = [];
        const timeZone = req.body.timeZone;
        const zoomLink = req.body.zoomLink;
        const schoolId = req.body.schoolId;

        // find or create College
        const newCollege = req.body.newCollege
        const collegeCountry = req.body.collegeCountry
        let existingCollegeId = req.body.existingCollegeId
        var college
        if (newCollege) {
            var newCollegeCreated = new collegeSchema({
                name: newCollege,
                country: collegeCountry
            })
            await newCollegeCreated.save()
            college = newCollegeCreated
        } else if (existingCollegeId) {
            college = await collegeSchema.findOne({_id: existingCollegeId})
        }

        // find or create Job Title
        const existingJobTitleId = req.body.existingJobTitleId
        const newJobTitle = req.body.newJobTitle
        var jobTitle
        if (newJobTitle) {
            var newJobTitleCreated = new jobTitleSchema({
                name: newJobTitle
            })
            await newJobTitleCreated.save()
            jobTitle = newJobTitleCreated
        } else if (existingJobTitleId) {
            jobTitle = await jobTitleSchema.findOne({_id: existingJobTitleId})
        }

        // find or create Company
        const existingCompanyId = req.body.existingCompanyId
        const newCompany = req.body.newCompany
        var company
        if (newCompany) {
            var newCompanyCreated = new companySchema({
                name: newCompany
            })
            await newCompanyCreated.save()
            var company = newCompanyCreated
        } else if (existingCompanyId) {
            company = await companySchema.findOne({_id: existingCompanyId})
        }

        const existingInterests = req.body.existingInterests
        // find existing interests
        const existingInterestsIds = existingInterests.map(interest => interest.value).flat()
        let existingInterestsRecords = await interestsSchema.find().where('_id').in(existingInterestsIds).exec()
        const newInterests = req.body.newInterests || []
        // create interests added
        if (newInterests.length) {
            for (let i = 0; i < newInterests.length; i++) {
                var newInterestCreated = new interestsSchema({
                    name: newInterests[i].value
                })
                await newInterestCreated.save()
                existingInterestsRecords.push(newInterestCreated)
            }
        }
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
                country: country,
                city: city,
                company: company,
                companyName: company && company.name,
                college: college,
                collegeName: college && college.name,
                jobTitle: jobTitle,
                jobTitleName: jobTitle && jobTitle.name,
                interests: existingInterestsRecords,
                availabilities: availabilities,
                timeZone: timeZone,
                zoomLink: zoomLink,
                approved: approved,
                school: schoolId
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
        await alumni_instance.save();
        await user_instance.save();
        res.status(200).send({
            message: 'Successfully added alumni',
            alumni: alumni_instance
        });
    } catch (e) {
        console.error('Error in alumni#add', e)
        res.status(500).send({
            message: 'Failed adding alumni: ' + e
        });
    }
});

router.get('/all/:timezone', async (req, res, next) => {
    try {
        let timezone = req.params.timezone
        let alumni = await alumniSchema.find()
        alumni = alumni.map(alumnus => {
            alumnus.availabilities = timezoneHelpers.applyTimezone(alumnus.availabilities, timezone)
            return alumnus
        })
        res.json({'alumni' : alumni});
    } catch (e) {
        console.log("Error: alumni#allAlumni", e);
        res.status(500).send({'error' : e});
    }
});


router.get('/unapproved/', async(req, res, next) => {
    try {
        const dbData = await alumniSchema.find({approved: false})
        res.json({'unapproved': dbData})
    } catch (e) {
        console.log("Error: util#unapprovedAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/approve/', async(req, res, next) => {
    try {
        const alumni = await alumniSchema.findOne({_id: req.body.id})
        alumni.approved = true
        await alumni.save();
        const dbData = await alumniSchema.find({approved: false})
        res.json({'unapproved': dbData, 'name': alumni.name})

    } catch (e) {
        console.log("Error: util#approveAlumni");
        res.status(500).send({'error': e});
    }
});

router.get('/one/:id', async (req, res, next) => {
    try {
        let alumnus = await alumniSchema.findOne({_id: req.params.id})
        alumnus.availabilities = timezoneHelpers.applyTimezone(alumnus.availabilities, alumnus.timeZone)
        res.json({'result' : alumnus});
    } catch (e) {
        console.log("Error: alumni#oneAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/topicOptions', async (req, res, next) => {
    const preloadedTopics = ['College Shortlisting', 'Career Counseling', 'Essay/Personal Statement Brainstorming', 'Motivation/Performance Coaching', 'Extra-curricular Activity Strategy', 'General Counsultation']
    res.status(200).send({topics: preloadedTopics})
})

router.patch('/timePreferences/:id', async (req, res, next) => {
    try {
        const alumni = await alumniSchema.findOne({_id: req.params.id})
        const timezoneAgnosticPreferences = timezoneHelpers.stripTimezone(req.body.timePreferences, alumni.timeZone || 0)
        alumni.availabilities = timezoneAgnosticPreferences
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's time preferences"})
    } catch (e) {
        console.log("Error: alumni#timePreferences", e);
        res.status(500).send({'error' : e});
    }
});

router.patch('/topicPreferences/:id', async (req, res, next) => {
    try {
        const alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.topics = req.body.topicPreferences
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's topic preferences"})
    } catch (e) {
        console.log("Error: alumni#topicPreferences", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/zoomLink/:id', async (req, res, next) => {
    try {
        const alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.zoomLink = req.body.zoomLink
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's zoom link"})
    } catch (e) {
        console.log("Error: alumni#zoomLink", e);
        res.status(500).send({'error' : e});
    }
})

module.exports = router;