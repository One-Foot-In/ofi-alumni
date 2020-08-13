var express = require('express');
var passport = require("passport");
var router = express.Router();
var collegeSchema = require('../models/collegeSchema');
var schoolSchema = require('../models/schoolSchema');
var alumniSchema = require('../models/alumniSchema');
var adminSchema = require('../models/adminSchema');
var studentSchema = require('../models/studentSchema');
var requestSchema = require('../models/requestSchema');
require('mongoose').Promise = global.Promise

async function isAdmin(id) {
    let admin = await adminSchema.findById(id)
    let alumni = await alumniSchema.findById(id).populate('user')
    return (admin !== null || (alumni && alumni.user.role.includes('ADMIN')))
}

router.get('/one/:id', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const dbData = await adminSchema.findOne({_id: req.params.id})
        res.json({'result' : dbData});
    } catch (e) {
        console.log("Error: util#oneAdmin", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/allAlumni/:adminId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        let dbData = await alumniSchema.find({}).populate('school')
        res.status(200).send({'alumni': dbData})
    } catch (e) {
        console.log('admin/allAlumni error: ' + e);
        res.status(500).send({'admin/allAlumni error' : e})
    }
});

router.get('/allStudents/:adminId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        let dbData = await studentSchema.find({}).populate('school')
        res.status(200).send({'students': dbData})
    } catch (e) {
        console.log('admin/allStudents error: ' + e);
        res.status(500).send({'admin/allStudents error' : e})
    }
});

router.get('/allColleges/:adminId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        let dbData = await collegeSchema.find({})
        res.status(200).send({'colleges': dbData})
    } catch (e) {
        console.log('admin/allColleges error: ' + e);
        res.status(500).send({'admin/allColleges error' : e})
    }
});

router.get('/allSchools/:adminId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        let dbData = await schoolSchema.find({})
        res.status(200).send({'schools': dbData})
    } catch (e) {
        console.log('admin/allSchools error: ' + e);
        res.status(500).send({'admin/allSchools error' : e})
    }
});

router.patch('/toggleApprove/:adminId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    let profileId = req.body.profileId;
    let type = req.body.type;
    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        if (type === 'ALUMNI') {
            let alumni = await alumniSchema.findById(profileId);
            alumni.approved = !alumni.approved;
            await alumni.save()
            let dbData = await alumniSchema.find({}).populate('school')
            res.status(200).send({profiles: dbData})
            return;
        } else if (type === 'STUDENT') {
            let student = await studentSchema.findById(profileId);
            student.approved = !student.approved;
            await student.save()
            let dbData = await studentSchema.find({}).populate('school')
            res.status(200).send({profiles: dbData})
            return;
        }
    } catch (e) {
        console.log('admin/toggleApprove error: ' + e)
        res.status(500).send({'toggleApprove error' : e})
    }
});

router.get('/feedback/:adminId/:profileId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId;
    let profileId = req.params.profileId;
    let public = [];
    let private = [];
    let testimonial = [];
    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
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
        console.log('admin/feedback error: ' + e);
        res.status(500).send({'admin/feedback error' : e})
    }
});

router.patch('/toggleModerator/:adminId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    let studentId = req.body.studentId
    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        let student = await studentSchema.findById(studentId)
        student.isModerator = !student.isModerator
        await student.save()
        let dbData = await studentSchema.find({}).populate('school')
        res.status(200).send({'students': dbData})
    } catch (e) {
        console.log('admin/allStudents error: ' + e);
        res.status(500).send({'admin/allStudents error' : e})
    }
});

router.patch('/mergeColleges/:adminid', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    let colleges = req.body.items
    let name = req.body.name
    let location = await collegeSchema.findById(colleges[0])
    let country = location.country
    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        let newCollege = new collegeSchema({name: name, country: country});
        await newCollege.save();
        let update = {
            college: newCollege._id,
            collegeName: newCollege.name
        }
        for (let college of colleges) {
            let alumni = await alumniSchema.updateMany({college: college}, update)
            await collegeSchema.findByIdAndDelete(college)
        }
        res.status(200).send({'message': 'Successfully merged colleges'})
    } catch (e) {
        console.log('/mergeColleges error:' + e);
        res.status(500).send({'admin/allStudents error' : e})
    }
});

router.post('/addSchool/:adminid', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    let country = req.body.country
    let name = req.body.name

    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
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

router.post('/addCollege/:adminid', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    let country = req.body.country
    let name = req.body.name

    try {
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        let college = new collegeSchema({
            name: name,
            country: country
        })
        await college.save();
        res.status(200).send({'message': 'Successfully added college'})
    } catch (e) {
        console.log('/addCollege error:' + e);
        res.status(500).send({'error' : 'Add College Error' + e})
    }
});

module.exports = router;