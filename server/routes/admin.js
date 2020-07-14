var express = require('express');
var passport = require("passport");
var router = express.Router();
var userSchema = require('../models/userSchema');
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
            throw new Error('Invalid Admin ID');
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
            throw new Error('Invalid Admin ID');
        }
        let dbData = await studentSchema.find({}).populate('school')
        res.status(200).send({'students': dbData})
    } catch (e) {
        console.log('admin/allStudents error: ' + e);
        res.status(500).send({'admin/allStudents error' : e})
    }
});

router.patch('/toggleApprove/:adminId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let adminId = req.params.adminId
    let profileId = req.body.profileId;
    let type = req.body.type;
    try {
        if (!isAdmin(adminId)) {
            throw new Error('Invalid Admin ID');
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
            throw new Error('Invalid Admin ID');
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

module.exports = router;