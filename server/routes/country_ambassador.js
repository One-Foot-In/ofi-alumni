var express = require('express');
var passport = require("passport");
var router = express.Router();
var schoolSchema = require('../models/schoolSchema');
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var userSchema = require('../models/userSchema');
var pollSchema = require('../models/polls/pollSchema');
var pollOptionSchema = require('../models/polls/pollOptionSchema');
const { sendPollAlert, sendApprovalAlert } = require('./helpers/emailHelpers');
require('mongoose').Promise = global.Promise

async function isCountryAmbassador(id, country) {
    let alumni = await alumniSchema.findById(id).populate('user')
    return (alumni && alumni.user.role.includes('COUNTRY_AMBASSADOR') && alumni.country === country)
}

/*
    Return all profiles (alumni or students) with the school and access context information populated for given country
    The country is determined from location of school and NOT where the alumni/students
    currently reside
    @param country
    @param role: ALUMNI | STUDENT
    @return array of alumni or student objects
*/
async function fetchAllProfilesWithAccessContexts(country, role) {
    let schoolsInCountry = await schoolSchema.find({country: country})
    let profileData = []
    if (role === "ALUMNI") {
        profileData = await alumniSchema.find().where('school').in(schoolsInCountry).populate('school').exec()
    } else if (role === "STUDENT") {
        profileData = await studentSchema.find().where('school').in(schoolsInCountry).populate('school').exec()
    }
    let profiles = []
    for (let profileModel of profileData) {
        let profile = profileModel.toObject()
        let userRecordWithAccessContext = await userSchema.findById(profileModel.user, {accessContexts: 1})
        // do not return profiles which do not have an associated user record
        if (userRecordWithAccessContext) {            
            profile.accessContexts = userRecordWithAccessContext.accessContexts
            profiles.push(profile)
        }
    }
    return profiles
}

router.get('/allAlumni/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId
    let country = req.params.country
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let alumni = await fetchAllProfilesWithAccessContexts(country, "ALUMNI")
        res.status(200).send({'alumni': alumni})
    } catch (e) {
        console.log('ambassador/allAlumni error: ' + e);
        res.status(500).send({'ambassador/allAlumni error' : e})
    }
});

router.get('/allStudents/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId
    let country = req.params.country
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let students = await fetchAllProfilesWithAccessContexts(country, "STUDENT")
        res.status(200).send({'students': students})
    } catch (e) {
        console.log('ambassador/allStudents error: ' + e);
        res.status(500).send({'ambassador/allStudents error' : e})
    }
});

router.get('/allSchools/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId
    let country = req.params.country
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let dbData = await schoolSchema.find({country: country})
        res.status(200).send({'schools': dbData})
    } catch (e) {
        console.log('ambassador/allSchools error: ' + e);
        res.status(500).send({'ambassador/allSchools error' : e})
    }
});

/**
 * Changes approval status on alumnus or student record, and refetches all profiles
 * @param {*} role 
 * @param {*} profileId
 * @param {*} country
 * @return Map with name, email, approval state, and all profiles refetched
 */
async function handleApprovalOperation (role, profileId, country) {
    let profile = null
    if (role === "ALUMNI") {
        profile = await alumniSchema.findById(profileId);
    } else if (role === "STUDENT") {
        profile = await studentSchema.findById(profileId);
    }
    let newApprovalState = !profile.approved
    profile.approved = newApprovalState;
    let userRecordForAlumnus = await userSchema.findById(profile.user, {email: 1})
    let email = userRecordForAlumnus.email
    let name = profile.name
    await profile.save()
    let dbData = await fetchAllProfilesWithAccessContexts(country, role)
    return {
        dbData: dbData,
        name: name,
        email: email,
        newApprovalState: newApprovalState
    }
}

router.patch('/toggleApprove/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId
    let country = req.params.country
    let profileId = req.body.profileId;
    let type = req.body.type;
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let approvalResponse = await handleApprovalOperation(type, profileId, country)
        if (approvalResponse.newApprovalState) {
            await sendApprovalAlert(approvalResponse.email, approvalResponse.name)
        }
        res.status(200).send({profiles: approvalResponse.dbData})
        return;
    } catch (e) {
        console.log('ambassador/toggleApprove error: ' + e)
        res.status(500).send({'toggleApprove error' : e})
    }
});

router.patch('/changeAccess/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId
    let country = req.params.country
    let userId = req.body.userId;
    let type = req.body.type;
    let accessContext = req.body.newAccessContext;
    let isGranting = req.body.isGranting;
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        if (!(["GLOBAL", "INTRASCHOOL", "INTERSCHOOL"].includes(accessContext))) {
            res.status(500).json({
                message: 'Invalid access context provided'
            });
            return;
        }
        let user = await userSchema.findById(userId);
        let newAccessContexts = []
        if (isGranting) {
            if (user.accessContexts.includes(accessContext)) {
                res.status(200).json({
                    message: 'User already has request access level'
                });
                return;
            } else {
                user.accessContexts.push(accessContext)
                newAccessContexts = user.accessContexts
            }
        } else {
            if (!user.accessContexts.includes(accessContext)) {
                res.status(200).json({
                    message: 'User does not currently have access level that is being revoked'
                });
                return;
            } else {
                user.accessContexts = user.accessContexts.filter(context => context !== accessContext);
                newAccessContexts = user.accessContexts
            }
        }
        await user.save()
        let dbData = await fetchAllProfilesWithAccessContexts(country, type)
        res.status(200).send({profiles: dbData});
        return;
    } catch (e) {
        console.log('ambassador/changeAccess error: ' + e)
        res.status(500).send({'changeAccess error' : e})
    }
});

router.get('/feedback/:alumniId/:country/:profileId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId;
    let country = req.params.country;
    let profileId = req.params.profileId;
    let public = [];
    let private = [];
    let testimonial = [];
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let allFeedback = await requestSchema.find({mentor: profileId}, 'publicFeedback privateFeedback testimonial')
        for (let feedback of allFeedback) {
            feedback = feedback.toObject()
            if (feedback.publicFeedback) {
                public.push(feedback.publicFeedback);
            } 
            if (feedback.privateFeedback) {
                private.push(feedback.privateFeedback);
            }
            if (feedback.testimonial) {
                testimonial.push(feedback.testimonial);
            }
        }
        let profile = await alumniSchema.findById(profileId)
        res.status(200).send(
            {
                public: public,
                private: private,
                testimonial: testimonial,
                profile: profile
            }
        );
    } catch (e) {
        console.log('ambassador/feedback error: ' + e);
        res.status(500).send({'ambassador/feedback error' : e})
    }
});

router.patch('/toggleModerator/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId;
    let country = req.params.country;
    let studentId = req.body.studentId
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let student = await studentSchema.findById(studentId)
        student.isModerator = !student.isModerator
        await student.save()
        let studentsData = await studentSchema.find().populate('school')
        studentsData = studentsData.filter(student => student.school.country === country)
        let students = []
        for (let studentModel of studentsData) {
            let student = studentModel.toObject()
            let userRecordWithAccessContext = await userSchema.findById(studentModel.user, {accessContexts: 1})
            student.accessContexts = userRecordWithAccessContext.accessContexts
            students.push(student)
        }
        res.status(200).send({'students': students})
    } catch (e) {
        console.log('ambassador/toggleModerator error: ' + e);
        res.status(500).send({'ambassador/toggleModerator error' : e})
    }
});

router.post('/addSchool/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId;
    let country = req.body.country
    let name = req.body.name
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let school = new schoolSchema({
            name: name,
            country: country
        })
        await school.save();
        res.status(200).send({'message': 'Successfully added school'})
    } catch (e) {
        console.log('/addSchool error:' + e);
        res.status(500).send({'error' : 'Add School Error' + e})
    }
});

router.get('/polls/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId;
    let country = req.params.country
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let schoolsInPurviewOfAmbassador = await schoolSchema.find({country: country})
        let polls = await pollSchema.find({schoolsTargetted: {$in: schoolsInPurviewOfAmbassador}}).populate('options schoolsTargetted')
        res.status(200).json({
            polls: polls
        })
    } catch (e) {
        console.log('/polls error:' + e);
        res.status(500).send({'error' : 'Fetching Polls' + e})
    }
});

async function queuePolls(schoolsTargetted, countriesTargetted, rolesTargetted, pollModel) {
    // by country
    let usersToQueuePollsFor = []
    let studentUsers = []
    let alumniUsers = []
    if (countriesTargetted.length) {
        // BOTH alumni and students
        if (rolesTargetted.includes('STUDENTS') && rolesTargetted.includes('ALUMNI')) {
            studentUsers = await studentSchema.find().where('country').in(countriesTargetted).exec()
            alumniUsers = await alumniSchema.find().where('country').in(countriesTargetted).exec()
        } else if (rolesTargetted.includes('ALUMNI')) {
            alumniUsers = await alumniSchema.find().where('country').in(countriesTargetted).exec()
        } else if (rolesTargetted.includes('STUDENTS')) {
            studentUsers = await studentSchema.find().where('country').in(countriesTargetted).exec()
        }
    }
    // by school
    else if (schoolsTargetted.length) {
        // BOTH alumni and students
        if (rolesTargetted.includes('STUDENTS') && rolesTargetted.includes('ALUMNI')) {
            studentUsers = await studentSchema.find().where('school').in(schoolsTargetted).exec()
            alumniUsers = await alumniSchema.find().where('school').in(schoolsTargetted).exec()
        } else if (rolesTargetted.includes('ALUMNI')) {
            alumniUsers = await alumniSchema.find().where('school').in(schoolsTargetted).exec()
        } else if (rolesTargetted.includes('STUDENTS')) {
            studentUsers = await studentSchema.find().where('school').in(schoolsTargetted).exec()
        }
    }
    // globally
    else {
        studentUsers = await studentSchema.find()
        alumniUsers = await alumniSchema.find()
    }
    for (let model of [...studentUsers, ...alumniUsers]) {
        usersToQueuePollsFor.push(model.user)
    }
    for (let user of usersToQueuePollsFor) {
        let userModel = await userSchema.findById(user)
        userModel.pollsQueued.push(pollModel)
        await userModel.save()
        // Hold off on sending emails as these API calls may climb fast
        // await sendPollAlert(userModel.email, (!pollModel.allowInput && !pollModel.options.length), pollModel.prompt)
    }
}

router.post('/addPoll/:alumniId/:country', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let alumniId = req.params.alumniId;
    let country = req.params.country
    try {
        if (!isCountryAmbassador(alumniId, country)) {
            res.status(400).send('Alumnus does not have access as ambassador for ' + country);
            return;
        }
        let rolesTargetted = []
        if (req.body.rolesTargetted === 'BOTH') {
            rolesTargetted = ['ALUMNI', 'STUDENTS']
        } else {
            rolesTargetted = [req.body.rolesTargetted]
        }
        let countriesTargetted = [country]
        let schoolsTargetted = req.body.schoolsTargetted
        let type = req.body.type
        let prompt = req.body.prompt
        let pollOptions = req.body.pollOptions
        let optionsCreatedForPoll = []
        if (['CUSTOM_POLL', 'NO_CUSTOM_POLL'].includes(type)) {
            if (!(pollOptions.length)) {
                res.status(400).send('No poll options provided');
                return;
            } else {
                // create pollOptions objects
                for (let option of pollOptions) {
                    let newOption = await pollOptionSchema({
                        optionText: option,
                        isCustom: false
                    })
                    await newOption.save()
                    optionsCreatedForPoll.push(newOption)
                }
            }
        }
        // create the poll
        let schoolsToAdd = []
        if (schoolsTargetted.length) {
            schoolsToAdd = await schoolSchema.find().where('_id').in(schoolsTargetted).exec()
        }
        let newPoll = await pollSchema({
            prompt: prompt,
            countriesTargetted: countriesTargetted,
            schoolsTargetted: schoolsToAdd,
            rolesTargetted: rolesTargetted,
            allowInput: type === 'CUSTOM_POLL',
            options: optionsCreatedForPoll
        })
        await newPoll.save()
        // do not wait on queueing polls
        queuePolls(schoolsTargetted, countriesTargetted, rolesTargetted, newPoll)
        res.status(200).json({
            message: 'Successfully added poll!'
        })
    } catch (e) {
        console.log('/addPoll error:' + e);
        res.status(500).send({'error' : 'Add Poll Error' + e})
    }
});

router.delete('/poll/:alumniId/:country/:pollId',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        let alumniId = req.params.alumniId;
        let country = req.params.country
        try {
            if (!isCountryAmbassador(alumniId, country)) {
                res.status(400).send('Alumnus does not have access as ambassador for ' + country);
                return;
            }
            // TODO: add mongoose schema pre-findOneAndRemove hook to delete poll options and pull from user records
            let poll = await pollSchema.findById(req.params.pollId)
            for (let option of poll.options) {
                await pollOptionSchema.deleteOne({_id: option})
            }
            await userSchema.updateMany({}, {$pull: {pollsQueued: poll._id}})
            await pollSchema.deleteOne({_id: req.params.pollId})
            res.status(200).json({message: 'Successfully deleted poll'})
        } catch (e) {
            console.log('/delete poll error:' + e);
            res.status(500).send({'error' : 'Delete Poll Error' + e})
        }
});


module.exports = router;