var express = require('express');
var passport = require("passport");
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var userSchema = require('../models/userSchema');
var studentSchema = require('../models/studentSchema');
var schoolSchema = require('../models/schoolSchema');
var newsSchema = require('../models/newsSchema');
var requestSchema = require('../models/requestSchema');
var sendStudentVerificationEmail = require('../routes/helpers/emailHelpers').sendStudentVerificationEmail
var generateNewAndExistingInterests = require("./alumni").generateNewAndExistingInterests
var getUniqueInterests = require("./alumni").getUniqueInterests
var awardReferralPoints = require("./alumni").awardReferralPoints
require('mongoose').Promise = global.Promise

var logger = require("../logging")

const HASH_COST = 10;

async function isModerator(studentId) {
    let student = await studentSchema.findOne({_id: studentId})
    return student.isModerator
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
        const grade = parseInt(req.body.grade);
        const password = req.body.password;
        const schoolId = req.body.schoolId;
        const imageURL = req.body.imageURL;
        // TODO: need to add timeZone in frontend request
        const timeZone = req.body.timeZone;
        const role = ["STUDENT"]
        const emailVerified = false
        const approved = false
        const verificationToken = crypto({length: 16});
        const emailSubscriptionToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)
        // find schoolLogo
        let school = await schoolSchema.findOne({_id: schoolId})

        // check if the user has been referred
        const referrerId = req.body.referrerId;
        if (referrerId) {
            await awardReferralPoints(referrerId)
        }

        const user_instance = new userSchema(
            {
              email: email,
              passwordHash: passwordHash,
              verificationToken: verificationToken,
              role: role,
              emailVerified: emailVerified,
              emailSubscribed: true,
              emailSubscriptionToken: emailSubscriptionToken,
              approved: approved,
              accessContexts: ["INTRASCHOOL"]
            }
        );
        await user_instance.save();
        
        var student_instance = new studentSchema(
            {
                name: name,
                user: user_instance._id,
                grade: grade,
                // requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
                // issuesLiked: [{type: Schema.Types.ObjectId, ref: 'issueSchema'}]
                school: schoolId,
                timeZone: -timeZone,
                schoolLogo: school.logoURL,
                imageURL: imageURL
            }
        )      
        await student_instance.save();
        const news_instance = new newsSchema(
            {
                event: 'New Student',
                students: [student_instance._id],
                school: schoolId,
                role: 'STUDENT',
                grade: grade
            }
        )
        await news_instance.save();
        // do not wait on sending verification email
        sendStudentVerificationEmail(email, verificationToken, school.name)
        res.status(200).send({
            message: 'Successfully added student',
            student: student_instance
        });
    } catch (e) {
        logger.error(`POST | action=student/ | email=${email} | error=${e}`)
        res.status(500).send({
            message: 'Failed adding student: ' + e
        });
    }
});

router.get('/one/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const dbData = await studentSchema.findOne({_id: req.params.id}).populate('school')
        const userRecord = await userSchema.findById(dbData.user)
        res.json({
            result : dbData,
            accessContexts: userRecord.accessContexts || ["INTRASCHOOL"]
        });
    } catch (e) {
        logger.error(`GET | action=/student/one | id=${req.params.id} | error=${e}`)
        res.status(500).send({'error' : e});
    }
});

router.get('/:studentId/moderator/:grade/unapproved', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        if (await isModerator(req.params.studentId)) {
            let unapproved =  await studentSchema.find({approved: false, grade: parseInt(req.params.grade)})
            res.status(200).json({unapproved})
        } else {
            res.status(400).send({message: 'Student does not have moderator access!'})
        }
    } catch (e) {
        logger.error(`GET | action=/student/moderator/unapproved | studentId=${req.params.studentId} | grade=${req.params.grade} | error=${e}`)
        res.status(500).send({'error' : e});
    }
});

router.post('/approve', passport.authenticate('jwt', {session: false}), async(req, res, next) => {
    try {
        const student = await studentSchema.findOne({_id: req.body.id})
        student.approved = true
        await student.save();
        const dbData = await studentSchema.find({approved: false, grade: parseInt(req.body.grade)})
        res.json({'unapproved': dbData, 'name': student.name})

    } catch (e) {
        logger.error(`POST | action=/student/approve | studentId=${req.body.id} | error=${e}`)
        res.status(500).send({'error': e});
    }
});

router.patch('/interests/remove/:id', async (req, res, next) => {
    try {
        const student = await studentSchema.findOne({_id: req.params.id})
        student.interests = student.interests.filter(interest => interest._id.toString() !== req.body.interestIdToRemove)
        await student.save()
        res.status(200).send({message: "Successfully removed student's interest"})
    } catch (e) {
        logger.error(`PATCH | action=/student/interests/remove | studentId=${req.params.id} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.patch('/interests/add/:id', async (req, res, next) => {
    try {
        let student = await studentSchema.findOne({_id: req.params.id})
        const existingInterests = req.body.existingInterests
        const newInterests = req.body.newInterests || []
        let interestsToAdd = await generateNewAndExistingInterests(existingInterests, newInterests)

        student.interests = getUniqueInterests([...student.interests, ...interestsToAdd])
        await student.save()
        res.status(200).send({message: "Successfully added student's interests"})
    } catch (e) {
        logger.error(`PATCH | action=/student/interests/add | studentId=${req.params.id} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.delete('/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let student = await studentSchema.findOne({_id: req.params.id})
        await userSchema.findByIdAndRemove({_id: student.user })
        await newsSchema.deleteMany({ student: { $in: [student._id] }})
        await requestSchema.deleteMany({ student: { $in: [student._id] }})
        await studentSchema.findOneAndRemove({_id: student._id })
        res.status(200).send({message: "Successfully removed student"})
    } catch (e) {
        logger.error(`DELETE | action=/student/ | studentId=${req.params.id} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.get('/opportunities/:studentId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let student = await studentSchema.findOne({_id: req.params.studentId})
        await student.populate('opportunitiesQueued').execPopulate()
        // only work with last 10 opportunities added for student
        let mostRecent10Opportunities = student.opportunitiesQueued.slice(-10)
        for (let opportunity of mostRecent10Opportunities) {
            await opportunity.populate('owner', 'name imageURL').execPopulate()
        }
        res.status(200).json({
            opportunities: mostRecent10Opportunities
        })
    } catch (e) {
        logger.error(`GET | action=/student/opportunities | studentId=${req.params.studentId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.get('/bookmarkedOpportunities/:studentId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let student = await studentSchema.findOne({_id: req.params.studentId})
        await student.populate('opportunitiesBookmarked').execPopulate()
        for (let opportunity of student.opportunitiesBookmarked) {
            await opportunity.populate('owner', 'name imageURL').execPopulate()
        }
        res.status(200).json({
            opportunities: student.opportunitiesBookmarked
        })
    } catch (e) {
        logger.error(`GET | action=/student/bookmarkedOpportunities | studentId=${req.params.studentId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.patch('/opportunity/interact/:studentId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let bookmarked = req.body.bookmarked
        let opportunityId = req.body.opportunityId
        let studentId = req.params.studentId
        if (bookmarked) {
            await studentSchema.update({_id: studentId}, {
                $push: {opportunitiesBookmarked: opportunityId},
                $pull: { opportunitiesQueued: opportunityId}
            })
        } else {
            await studentSchema.update({_id: studentId}, {
                $pull: { opportunitiesQueued: opportunityId}
            })
        }
        res.status(200).json({
            message: 'Your response to this opportunity has been recorded!'
        })
    } catch (e) {
        logger.error(`PATCH | action=/student/opportunity/interact | studentId=${req.params.studentId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.patch('/unbookmarkOpportunity/:studentId/:opportunityId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let opportunityId = req.params.opportunityId
        let studentId = req.params.studentId
        await studentSchema.update({_id: studentId}, {
            $pull: {opportunitiesBookmarked: opportunityId},
        })
        res.status(200).json({
            message: 'Opportunity is unbookmarked!'
        })
    } catch (e) {
        logger.error(`GET | action=/student/unbookmarkOpportunity | studentId=${req.params.studentId} | opportunityId=${req.params.opportunityId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.get('/approvedRequestsCount/:studentId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let student = await studentSchema.findOne({_id: req.params.studentId})
        let approvedRequestsCount = await requestSchema.count({student: student, status: 'Confirmed'})
        res.status(200).send({approvedRequestsCount: approvedRequestsCount})
    } catch (e) {
        logger.error(`GET | action=/student/approvedRequestsCount | studentId=${req.params.studentId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

module.exports = router;