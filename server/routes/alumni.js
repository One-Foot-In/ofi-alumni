var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var passport = require("passport");
var userSchema = require('../models/userSchema');
var alumniSchema = require('../models/alumniSchema');
var collegeSchema = require('../models/collegeSchema');
var jobTitleSchema = require('../models/jobTitleSchema');
var interestsSchema = require('../models/interestsSchema');
var companySchema = require('../models/companySchema');
var schoolSchema = require('../models/schoolSchema');
var newsSchema = require('../models/newsSchema');
var timezoneHelpers = require("../helpers/timezoneHelpers")
var sendAlumniVerificationEmail = require('../routes/helpers/emailHelpers').sendAlumniVerificationEmail
require('mongoose').Promise = global.Promise

const HASH_COST = 10;

const generateNewAndExistingInterests = async (existingInterests, newInterests) => {
    const existingInterestsIds = existingInterests.map(interest => interest.value).flat()
    let existingInterestsRecords = await interestsSchema.find().where('_id').in(existingInterestsIds).exec()
    // create interests added
    if (newInterests.length) {
        for (let i = 0; i < newInterests.length; i++) {
            // check to see if interest name already exists
            let interestExists = await interestsSchema.find({name: newInterests[i].value})
            if (!interestExists.length) {
                var newInterestCreated = new interestsSchema({
                    name: newInterests[i].value
                })
                await newInterestCreated.save()
                existingInterestsRecords.push(newInterestCreated)
            } else {
                // user accidentally added an interest that already exists as a new interest
                existingInterestsRecords.push(interestExists[0])
            }
        }
    }
    return existingInterestsRecords
}

const getUniqueInterests = (allInterests) => {
    let allUniqueNames = new Set()
    let uniqueInterests = []
    for (let i = 0; i < allInterests.length; i++) {
        if (!allUniqueNames.has(allInterests[i].name)) {
            allUniqueNames.add(allInterests[i].name)
            uniqueInterests.push(allInterests[i])
        }
    }
    return uniqueInterests
}

router.post('/', async (req, res, next) => {
    try {
        const email = req.body.email;
        const name = req.body.name;
        const gradYear = parseInt(req.body.graduationYear);
        const country = req.body.country;
        const city = req.body.city;
        const password = req.body.password;
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
        const newInterests = req.body.newInterests || []
        let interests = await generateNewAndExistingInterests(existingInterests, newInterests)

        // find schoolLogo
        let school = await schoolSchema.findOne({_id: schoolId})
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
                interests: interests,
                availabilities: availabilities,
                timeZone: -timeZone,
                zoomLink: zoomLink,
                approved: approved,
                school: schoolId,
                schoolLogo: school.logoURL
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
        const news_instance = new newsSchema({
            event: 'New Alumni',
            alumni: [alumni_instance._id],
            school: schoolId
        })
        await news_instance.save();
        await sendAlumniVerificationEmail(email, verificationToken, school.name)
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

router.get('/all/:schoolId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let alumni = await alumniSchema.find({school: req.params.schoolId})
        res.json({'alumni' : alumni});
    } catch (e) {
        console.log("Error: alumni#allAlumni", e);
        res.status(500).send({'error' : e});
    }
});


router.get('/unapproved/:schoolId', passport.authenticate('jwt', {session: false}), async(req, res, next) => {
    try {
        const dbData = await alumniSchema.find({approved: false, school: req.params.schoolId})
        res.json({'unapproved': dbData})
    } catch (e) {
        console.log("Error: util#unapprovedAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/approve/', passport.authenticate('jwt', {session: false}), async(req, res, next) => {
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

router.get('/one/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
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

router.patch('/timePreferences/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
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

router.patch('/topicPreferences/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
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

router.patch('/zoomLink/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
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

router.patch('/interests/remove/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.interests = alumni.interests.filter(interest => interest._id.toString() !== req.body.interestIdToRemove)
        await alumni.save()
        res.status(200).send({message: "Successfully removed alumni's interest"})
    } catch (e) {
        console.log("Error: alumni#interests/remove", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/interests/add/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        const existingInterests = req.body.existingInterests
        const newInterests = req.body.newInterests || []
        let interestsToAdd = await generateNewAndExistingInterests(existingInterests, newInterests)

        alumni.interests = getUniqueInterests([...alumni.interests, ...interestsToAdd])
        await alumni.save()
        res.status(200).send({message: "Successfully added alumni's interests"})
    } catch (e) {
        console.log("Error: alumni#interests/add", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/collegeAndCareer/update/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        let existingJobTitleId = req.body.existingJobTitleId
        let existingJobTitleName = req.body.existingJobTitleName
        let newJobTitle = req.body.newJobTitle
        let existingCompanyId = req.body.existingCompanyId
        let existingCompanyName = req.body.existingCompanyName
        let newCompany = req.body.newCompany
        let country = req.body.country
        let newCollege = req.body.newCollege
        let existingCollegeId = req.body.existingCollegeId
        let existingCollegeName = req.body.existingCollegeName
        // update college
        if (existingCollegeId || newCollege) {
            if (existingCollegeId) {
                alumni.college = existingCollegeId
                alumni.collegeName = existingCollegeName
            } else {
                var newCollegeCreated = new collegeSchema({
                    name: newCollege,
                    country: country
                })
                await newCollegeCreated.save()
                alumni.college = newCollegeCreated
                alumni.collegeName = newCollegeCreated.name
            }
        }
        // update company
        if (existingCompanyId || newCompany) {
            if (existingCompanyId) {
                alumni.company = existingCompanyId
                alumni.companyName = existingCompanyName
            } else {
                var newCompanyCreated = new companySchema({
                    name: newCompany
                })
                await newCompanyCreated.save()
                alumni.company = newCompanyCreated
                alumni.companyName = newCompanyCreated.name
            }
        }
        // update job title
        if (existingJobTitleId || newJobTitle) {
            if (existingJobTitleId) {
                alumni.jobTitle = existingJobTitleId
                alumni.jobTitleName = existingJobTitleName
            } else {
                var newJobTitleCreated = new jobTitleSchema({
                    name: newJobTitle
                })
                await newJobTitleCreated.save()
                alumni.jobTitle = newJobTitleCreated
                alumni.jobTitleName = newJobTitleCreated.name
            }
        }
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's college and career information1"})
    } catch (e) {
        console.log("Error: alumni#collegeAndCareer/update", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/location/update/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.country = req.body.country
        alumni.city = req.body.city
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's location"})
    } catch (e) {
        console.log("Error: alumni#location/update", e);
        res.status(500).send({'error' : e});
    }
})

module.exports = router;
module.exports.generateNewAndExistingInterests = generateNewAndExistingInterests
module.exports.getUniqueInterests = getUniqueInterests