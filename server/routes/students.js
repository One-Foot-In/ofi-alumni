var express = require('express');
var passport = require("passport");
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var userSchema = require('../models/userSchema');
var studentSchema = require('../models/studentSchema');
var schoolSchema = require('../models/schoolSchema');
var collegeSchema = require('../models/collegeSchema');
var newsSchema = require('../models/newsSchema');
var requestSchema = require('../models/requestSchema');
var sendStudentVerificationEmail = require('../routes/helpers/emailHelpers').sendStudentVerificationEmail
var generateNewAndExistingInterests = require("./alumni").generateNewAndExistingInterests
var getUniqueInterests = require("./alumni").getUniqueInterests
require('mongoose').Promise = global.Promise

const HASH_COST = 10;

async function isModerator(studentId) {
    let student = await studentSchema.findOne({_id: studentId})
    return student.isModerator
}

router.post('/', async (req, res, next) => {
    try {
        const email = req.body.email;
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
        const user_instance = new userSchema(
            {
              email: email,
              passwordHash: passwordHash,
              verificationToken: verificationToken,
              role: role,
              emailVerified: emailVerified,
              emailSubscribed: true,
              emailSubscriptionToken: emailSubscriptionToken,
              approved: approved
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
        console.error("Error: students#one", e)
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
        console.log("Error: util#oneStudent", e);
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
        console.log("Error: util#moderator/unapproved", e);
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
        console.log("Error: util#approveStudent");
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
        console.log("Error: student#interests/remove", e);
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
        console.log("Error: student#interests/add", e);
        res.status(500).send({'error' : e});
    }
})

router.patch('/collegeShortlist/update/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let existingCollegeId = req.body.existingCollegeId
        var college = await collegeSchema.findOne({_id: existingCollegeId})
        let student = await studentSchema.findOne({_id: req.params.id})
        student.collegeShortlist.push(college._id);
        student.markModified('collegeShortlist');
        
        await student.save()
        res.status(200).send({student: student})
    } catch (e) {
        console.log("Error: student#college/update", e);
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
        console.log("Error: student#delete", e);
        res.status(500).send({'error' : e});
    }
})

module.exports = router;