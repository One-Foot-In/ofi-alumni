var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var passport = require("passport");
var userSchema = require('../models/userSchema');
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var collegeSchema = require('../models/collegeSchema');
var jobTitleSchema = require('../models/jobTitleSchema');
var interestsSchema = require('../models/interestsSchema');
var companySchema = require('../models/companySchema');
var schoolSchema = require('../models/schoolSchema');
var newsSchema = require('../models/newsSchema');
var majorSchema = require('../models/majorSchema');
var requestSchema = require('../models/requestSchema');
var conversationSchema = require('../models/conversationSchema');
var timezoneHelpers = require("../helpers/timezoneHelpers");
const opportunitySchema = require('../models/opportunitySchema');
var sendAlumniVerificationEmail = require('../routes/helpers/emailHelpers').sendAlumniVerificationEmail;
const { ObjectId } = require('mongodb');
var timezoneHelpers = require("../helpers/timezoneHelpers");
var sendAlumniVerificationEmail = require('../routes/helpers/emailHelpers').sendAlumniVerificationEmail

require('mongoose').Promise = global.Promise

const HASH_COST = 10;

/**
 * Prevents users from accidentally creating an existing item as a custom new entry
 * @param {String} newItem 
 * @param {MongooseSchema} schema 
 */
const generateNewIfAbsent = async (newItem, schema) => {
    let itemFound = await schema.find({name: newItem})
    if (!itemFound.length) {
        var newItemCreated = new schema({
            name: newItem
        })
        await newItemCreated.save()
        return newItemCreated
    }
    return itemFound[0]
}

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

const generateNewAndExistingCollege = async (existingColleges, newCollege) => {
    let existingCollegeNames = [];
    let newCollegeNames = [];
    for (let i = 0; i < existingColleges.length; i++){
        let collegeName = existingColleges[i].name;
        existingCollegeNames.push(collegeName)
    }
    for (let i = 0; i < newCollege.length; i++){
        let collegeName = newCollege[i].name;
        newCollegeNames.push(collegeName)
    }
    let existingCollegeRecords = await collegeSchema.find().where('name').in(existingCollegeNames).exec();
    if(newCollegeNames.length){
        for (let i = 0; i < newCollegeNames.length; i++){
            let collegeExists = await collegeSchema.find({name: newCollegeNames[i]});
            if(!collegeExists.length){
                var newCollegeMade = new collegeSchema({
                    name: newColleges[i].name,
                    country: newColleges[i].country
                })
                await newCollegeMade.save()
                existingCollegeRecords.push(newCollegeMade)
            } else {
                existingCollegeRecords.push(collegeExists[0])
            }
        }
    }
    return existingCollegeRecords
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

const getUniqueCollege = (allColleges) => {
    let allUniqueColleges = new Set();
    let uniqueColleges = [];
    for (let i = 0; i < allColleges.length; i++){
        if (!allUniqueColleges.has(allColleges[i].name)){
            allUniqueColleges.add(allColleges[i].name);
            uniqueColleges.push(allColleges[i]);
        }
    }
    return uniqueColleges
}

router.post('/', async (req, res, next) => {
    try {
        const email = req.body.email;

        if (!email) {
            res.status(500).json({
                error: 'No email was provided!'
            })
            return
        }

        let userRecord = await userSchema.findOne({email: email})
        if (userRecord) {
            res.status(500).json({
                error: "There is already an existing account with this email!"
            })
            return
        }

        const name = req.body.name;
        const gradYear = parseInt(req.body.graduationYear);
        const country = req.body.country;
        const city = req.body.city;
        const password = req.body.password;
        const availabilities = [];
        const timeZone = req.body.timeZone;
        const zoomLink = req.body.zoomLink;
        const schoolId = req.body.schoolId;
        const imageURL = req.body.imageURL;
        const topics = req.body.topics;

        // find or create College
        const newCollege = req.body.newCollege
        const collegeCountry = req.body.collegeCountry
        let existingCollegeId = req.body.existingCollegeId
        var college
        if (newCollege) {
            // to prevent users from accidentally adding an existing college as custom entry
            let collegeFound = await collegeSchema.find({name: newCollege, country: collegeCountry})
            if (!collegeFound.length) {
                var newCollegeCreated = new collegeSchema({
                    name: newCollege,
                    country: collegeCountry
                })
                await newCollegeCreated.save()
                college = newCollegeCreated
            } else {
                college = collegeFound[0]
            }
        } else if (existingCollegeId) {
            college = await collegeSchema.findOne({_id: existingCollegeId})
        }

        // find or create Job Title
        const existingJobTitleId = req.body.existingJobTitleId
        const newJobTitle = req.body.newJobTitle
        var jobTitle
        if (newJobTitle) {
            jobTitle = await generateNewIfAbsent(newJobTitle, jobTitleSchema)
        } else if (existingJobTitleId) {
            jobTitle = await jobTitleSchema.findOne({_id: existingJobTitleId})
        }

        // find or create Company
        const existingCompanyId = req.body.existingCompanyId
        const newCompany = req.body.newCompany
        var company
        if (newCompany) {
            company = await generateNewIfAbsent(newCompany, companySchema)
        } else if (existingCompanyId) {
            company = await companySchema.findOne({_id: existingCompanyId})
        }

        // find or create Major
        const existingMajorId = req.body.existingMajorId
        const newMajor = req.body.newMajor
        var major
        if (newMajor) {
            major = await generateNewIfAbsent(newMajor, majorSchema)
        } else if (existingMajorId) {
            major = await majorSchema.findOne({_id: existingMajorId})
        }

        const existingInterests = req.body.existingInterests || []
        const newInterests = req.body.newInterests || []
        let interests = await generateNewAndExistingInterests(existingInterests, newInterests)

        // find schoolLogo
        let school = await schoolSchema.findOne({_id: schoolId})
        // all alumni are started with INTRASCHOOL as default role
        const role = ["ALUMNI"]
        const accessContexts = ['INTRASCHOOL']
        const emailVerified = false
        const approved = false
        const verificationToken = crypto({length: 16});
        const emailSubscriptionToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)

        const user_instance = new userSchema(
            {
              email: email,
              passwordHash: passwordHash,
              verificationToken: verificationToken,
              role: role,
              accessContexts: accessContexts,
              emailVerified: emailVerified,
              emailSubscribed: true,
              emailSubscriptionToken: emailSubscriptionToken,
              approved: approved
            }
        );
        await user_instance.save();
        var alumni_instance = new alumniSchema(
            {
                name: name,
                user: user_instance._id,
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
                schoolLogo: school.logoURL,
                major: major,
                majorName: major && major.name,
                imageURL: imageURL,
                topics: topics,
            }
        )
        await alumni_instance.save();
        const news_instance = new newsSchema({
            event: 'New Alumni',
            alumni: [alumni_instance._id],
            school: schoolId
        })
        await news_instance.save();
        // do not wait on sending verification email
        sendAlumniVerificationEmail(email, verificationToken, school.name)
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

/*
    API used by students and alumni alike
    Return all alumni accessible in intraschool, interschool (country-wide), or global context
    @param schoolId - ID of school for alumnus/ student
    @param role - role that the user is requesting context for
    @param userId
*/
router.get('/all/:schoolId/:accessContext/:userId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let accessContext = req.params.accessContext
        let userRecord = await userSchema.findById(req.params.userId)
        if (accessContext &&!userRecord.accessContexts.includes(accessContext)) {
            res.status(404).json({
                message : `User does not have access level ${accessContext}`
            });
        } else {
            let isAlumni = userRecord.role.includes("ALUMNI")
            let alumni = []
            if (!accessContext || accessContext === "INTRASCHOOL") {
                alumni = await alumniSchema.find({school: req.params.schoolId})
            } else if (accessContext === "INTERSCHOOL") {
                if (isAlumni) {
                    let alumnusCountry = await alumniSchema.findOne({user: req.params.userId}, {country: 1})
                    alumni = await alumniSchema.find({country: alumnusCountry.country})
                } else {
                    let studentCountry = await studentSchema.findOne({user: req.params.userId}, {country: 1})
                    alumni = await alumniSchema.find({country: studentCountry.country})
                }
            } else if (accessContext === "GLOBAL") {
                alumni = await alumniSchema.find()
            }
            res.status(200).json({'alumni' : alumni});
        }
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
        let alumnus = await alumniSchema.findOne({_id: req.params.id}).populate('school')
        const userRecord = await userSchema.findById(alumnus.user)
        alumnus.availabilities = timezoneHelpers.applyTimezone(alumnus.availabilities, alumnus.timeZone)
        res.json({
            result : alumnus,
            accessContexts: userRecord.accessContexts || ["INTRASCHOOL"]
        });
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
        const news_instance = new newsSchema({
            event: 'New Topics',
            alumni: [alumni._id],
            school: alumni.school
        })
        await news_instance.save()
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

router.patch('/jobTitle/update/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        // find or create Job Title
        const existingJobTitleId = req.body.existingJobTitleId
        const newJobTitle = req.body.newJobTitle
        var jobTitle
        if (newJobTitle) {
            jobTitle = await generateNewIfAbsent(newJobTitle, jobTitleSchema)
        } else if (existingJobTitleId) {
            jobTitle = await jobTitleSchema.findOne({_id: existingJobTitleId})
        }
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.jobTitle = jobTitle
        alumni.jobTitleName = jobTitle.name
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's jobTitle information!"})
    } catch (e) {
        console.log("Error: alumni#jobTitle/update", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/company/update/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const existingCompanyId = req.body.existingCompanyId
        const newCompany = req.body.newCompany
        var company
        if (newCompany) {
            company = await generateNewIfAbsent(newCompany, companySchema)
        } else if (existingCompanyId) {
            company = await companySchema.findOne({_id: existingCompanyId})
        }
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.company = company
        alumni.companyName = company.name
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's company information!"})
    } catch (e) {
        console.log("Error: alumni#company/update", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/major/update/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const existingMajorId = req.body.existingMajorId
        const newMajor = req.body.newMajor
        var major
        if (newMajor) {
            major = await generateNewIfAbsent(newMajor, majorSchema)
        } else if (existingMajorId) {
            major = await majorSchema.findOne({_id: existingMajorId})
        }
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.major = major
        alumni.majorName = major.name
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's major information!"})
    } catch (e) {
        console.log("Error: alumni#major/update", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/college/update/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        // find or create College
        const newCollege = req.body.newCollege
        const collegeCountry = req.body.collegeCountry
        let existingCollegeId = req.body.existingCollegeId
        var college
        if (newCollege) {
            // to prevent users from accidentally adding an existing college as custom entry
            let collegeFound = await collegeSchema.find({name: newCollege, country: collegeCountry})
            if (!collegeFound.length) {
                var newCollegeCreated = new collegeSchema({
                    name: newCollege,
                    country: collegeCountry
                })
                await newCollegeCreated.save()
                college = newCollegeCreated
            } else {
                college = collegeFound[0]
            }
        } else if (existingCollegeId) {
            college = await collegeSchema.findOne({_id: existingCollegeId})
        }
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.college = college
        alumni.collegeName = college.name
        await alumni.save()
        res.status(200).send({message: "Successfully updated alumni's college information!"})
    } catch (e) {
        console.log("Error: alumni#college/update", e);
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

router.delete('/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        await userSchema.findByIdAndRemove({_id: alumni.user })
        await newsSchema.deleteMany({ alumni: { $in: [alumni._id] }})
        await requestSchema.deleteMany({ alumni: { $in: [alumni._id] }})
        await alumniSchema.findOneAndRemove({_id: alumni._id})
        res.status(200).send({message: "Successfully removed alumni"})
    } catch (e) {
        console.log("Error: alumni#delete", e);
        res.status(500).send({'error' : e});
    }
})

async function queueOpportunities(alumnusModel, opportunityModel) {
    let studentsToQueueOpportunitiesFor = await studentSchema.find({
        school: {$in: alumnusModel.school}
    })
    let userRecordForAlumnus = await userSchema.findById(alumnusModel.user)
    let userRecordsForStudentsToQueueOpportunitiesFor = []
    if (userRecordForAlumnus.accessContexts.includes("INTERSCHOOL") && !userRecordForAlumnus.accessContexts.includes("GLOBAL")) {
        userRecordsForStudentsToQueueOpportunitiesFor = await userSchema.find({
            role: {$in : ["STUDENT"]},
            accessContexts: {$in: ["INTERSCHOOL"]}
        })
    } else if (userRecordForAlumnus.accessContexts.includes("GLOBAL")) {
        userRecordsForStudentsToQueueOpportunitiesFor = await userSchema.find({
            role: {$in : ["STUDENT"]},
            accessContexts: {$in: ["GLOBAL"]}
        })
    }
    let contextBasedStudentAdditions = await studentSchema.find({
        user: {$in: userRecordsForStudentsToQueueOpportunitiesFor.map(user => user._id)}
    })
    studentsToQueueOpportunitiesFor = [...studentsToQueueOpportunitiesFor, ...contextBasedStudentAdditions]
    for (let student of studentsToQueueOpportunitiesFor) {
        student.opportunitiesQueued.push(opportunityModel)
        student.save()
    }
}

router.post('/opportunity/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        let description = req.body.description
        let existingInterests = req.body.existingInterests || []
        let newInterests = req.body.newInterests || []
        let interestsToAdd = []
        if (newInterests.length || existingInterests.length) {
            interestsToAdd = await generateNewAndExistingInterests(newInterests, existingInterests)
        }
        let deadline = req.body.deadline
        let link = req.body.link
        let newOpportunity = new opportunitySchema({
            owner: alumni,
            description: description,
            interests: interestsToAdd,
            deadline: deadline,
            link: link
        })
        await newOpportunity.save()
        alumni.opportunities.push(newOpportunity)
        alumni.footyPoints += 8;
        await alumni.save()
        // do not wait on finishing request
        queueOpportunities(alumni, newOpportunity)
        res.status(200).send({message: "Successfully added new opportunity"})
    } catch (e) {
        console.log("Error: alumni#addOpportunity", e);
        res.status(500).send({'error' : e});
    }
})

router.delete('/opportunity/:alumniId/:oppId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        await alumniSchema.update({_id: req.params.alumniId}, {$pull:{opportunities: req.params.oppId}})
        await studentSchema.updateMany({}, {$pull: {opportunitiesQueued: req.params.oppId, opportunitiesBookmarked: req.params.oppId}})
        await opportunitySchema.remove({_id: req.params.oppId})
        res.status(200).send({message: "Successfully removed opportunity"})
    } catch (e) {
        console.log("Error: alumni#removeOpportunity", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/opportunity/:oppId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let description = req.body.description
        let existingInterests = req.body.existingInterests
        let newInterests = req.body.newInterests || []
        let interestsToAdd = []
        if (newInterests.length && existingInterests.length) {
            interestsToAdd = await generateNewAndExistingInterests(existingInterests, newInterests)
        }
        let deadline = req.body.deadline
        let link = req.body.link
        let opportunityToUpdate = await opportunitySchema.findById(req.params.oppId)
        opportunityToUpdate.description = description ? description : opportunityToUpdate.description
        // only update interest if there is a difference in any existing interest
        opportunityToUpdate.interests = (opportunityToUpdate.interests.every(int1 => {
            interestsToAdd.some(int2 => int2._id === int1._id)
        })) ? opportunityToUpdate.interests : interestsToAdd
        opportunityToUpdate.link = link ? link : opportunityToUpdate.link
        opportunityToUpdate.deadline = deadline ? deadline : opportunityToUpdate.deadline
        opportunityToUpdate.save()
        res.status(200).send({message: "Successfully updated opportunity"})
    } catch (e) {
        console.log("Error: alumni#updateOpportunity", e);
        res.status(500).send({'error' : e});
    }
})

router.get('/opportunities/:alumniId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let alumni = await alumniSchema.findOne({_id: req.params.alumniId})
        await alumni.populate('opportunities').execPopulate()
        let opportunitiesArray = alumni.toObject().opportunities
        for (let opportunityObj of opportunitiesArray) {
            opportunityObj.timesBookmarked = await studentSchema.count({opportunitiesBookmarked: { $in: opportunityObj._id }})
        }
        res.status(200).send({opportunities: opportunitiesArray})
    } catch (e) {
        console.log("Error: alumni#opportunities", e);
        res.status(500).send({'error' : e});
    }
})

router.get('/unseenMessagesCount/:alumniId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        // get all conversations alumni have participated in
        let relevantConversations = await conversationSchema.find({alumni: {$in: ObjectId(req.params.alumniId)}})
        let unseenMessagesCount = 0
        for (let convo of relevantConversations) {
            if (!convo.seen[convo.alumni.indexOf(ObjectId(req.params.alumniId))]) {
                unseenMessagesCount++
            }
        } 
        res.status(200).send({unseenMessagesCount: unseenMessagesCount})
    } catch (e) {
        console.log("Error: alumni#unseenMessagesCount", e);
        res.status(500).send({'error' : e});
    }
})

router.get('/newRequestsCount/:alumniId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let alumni = await alumniSchema.findOne({_id: req.params.alumniId})
        let newRequestsCount = await requestSchema.count({mentor: alumni, status: 'Awaiting Confirmation'})
        res.status(200).send({newRequestsCount: newRequestsCount})
    } catch (e) {
        console.log("Error: alumni#newRequestsCount", e);
        res.status(500).send({'error' : e});
    }
})



router.patch('/collegesAcceptedInto/add/:id', /*passport.authenticate('jwt' {session: false}, */ async (req, res, next) => {
    try{
        let alumni = await alumniSchema.findOne({_id: req.params.id});
        const existingColleges = req.body.existingColleges || [];
        const newColleges = req.body.newColleges;
        let collegesToAdd = await generateNewAndExistingCollege(existingColleges, newColleges);
        alumni.collegesAcceptedInto = getUniqueCollege([...alumni.collegesAcceptedInto, ...collegesToAdd]);
        await alumni.save(); 
        res.status(200).json({message: `your colleges have been added successfully!`});
    } catch(e) {
        console.log("Error: cannot add college", e);
        res.status(500).json({'error': e});
    };
});

router.patch('/collegesAcceptedInto/delete/:id', /*passport.authenticate('jwt', {session: false}),*/ async (req, res, next) => {
    try{
        const alumni = await alumniSchema.findOne({_id: req.params.id});
        const collegeName = req.body.collegeToRemove.name;
        const collegesInfoForFilter = await collegeSchema.findOne().where('name').in(collegeName).exec();
        const theCollegeId = collegesInfoForFilter.id;
        let newCollegeList = [];
        for (let i = 0; i < alumni.collegesAcceptedInto.length; i++){
            if (alumni.collegesAcceptedInto[i].toString() !== theCollegeId.toString()){
                newCollegeList.push(alumni.collegesAcceptedInto[i])
            }
        };
        alumni.collegesAcceptedInto = newCollegeList;
        await alumni.save();
        res.status(200).json({message: "Successfully removed college from list!"});
    }catch(e){
        console.log("error: alumni college removal error", e);
        res.status(500).json({'error': e});
    }
})

router.get('/collegesAcceptedInto/all/:id', /*passport.authenticate('jwt', {session: false})*/ async (req, res, next) =>{
    try{
         const alumni = await alumniSchema
            .findOne({_id: req.params.id})
            .populate('collegesAcceptedInto')
            .exec();
        let collegesAcceptedInto = alumni.collegesAcceptedInto;
        console.log(collegesAcceptedInto);
        res.status(200).json(collegesAcceptedInto)
    }
    catch (e){
        console.log('Unable to get collegesAcceptedInto at this time')
        console.log(e)
        res.status(500).json({'error': e})
    }
})

module.exports = router;
module.exports.generateNewAndExistingInterests = generateNewAndExistingInterests
module.exports.getUniqueInterests = getUniqueInterests
module.exports.generateNewAndExistingCollege = generateNewAndExistingCollege
module.exports.getUniqueCollege = getUniqueCollege