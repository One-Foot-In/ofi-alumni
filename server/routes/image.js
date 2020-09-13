var express = require('express');
var passport = require("passport");
var router = express.Router();
var AWS = require('aws-sdk');
var bluebird = require('bluebird');
require('dotenv').config();
var adminSchema = require('../models/adminSchema');
var schoolSchema = require('../models/schoolSchema');
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
require('mongoose').Promise = global.Promise
var bcrypt = require('bcrypt');
var moment = require('moment');
var multer = require('multer'), multerS3 = require('multer-s3');

const HASH_COST = 4;

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
  
// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);

// create S3 instance
const s3 = new AWS.S3();

var multerUpload = (keyCallBack) => {
    return multer({
        limits: {
            fileSize: 20 * 1048576 // 20MB max fileSize, will need to reduce this and apply frontend check for max file size
        },
        storage: multerS3({
            s3: s3,
            bucket: process.env.S3_BUCKET,
            acl: 'public-read',
            cacheControl: 'max-age=31536000',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: keyCallBack
        })
    })
};

// TODO: this potentially leaves S3 bucket being polluted with images, but these images will never be associated to any user
router.post('/add', multerUpload(
        async (req, file, cb) => {
            let email = req.body.email;
            let emailHash = await bcrypt.hash(email, HASH_COST);
            let fileName = `${emailHash.replace('/', '')}-${moment().format('MM-DD-YYYY')}`;
            cb(null, fileName);
        }
    ).single('imageFile'),
    async (req, res, next) => {
    try {
        let imageLocation = req.file.location;
        res.status(200).send({
            success: true,
            imageUrl: imageLocation
        });
    } catch (e) {
        console.log("Error: image#addImage", e);
        res.status(500).send({'error' : e});
    }
});

async function isAdmin(id) {
    let admin = await adminSchema.findById(id)
    let alumni = await alumniSchema.findById(id).populate('user')
    return (admin !== null || (alumni && alumni.user.role.includes('ADMIN')))
}

router.post('/alumni/:alumniId', passport.authenticate('jwt', {session: false}), multerUpload(
    async (req, file, cb) => {
        cb(null, `alumni-${req.params.alumniId}`);
    }
).single('imageFile'), async (req, res, next) => {
    try {
        let imageLocation = req.file.location
        let alumni = await alumniSchema.findOne({_id: req.params.alumniId})
        alumni.imageURL = imageLocation
        await alumni.save()
        res.status(200).send({
            success: true
        })
    } catch (e) {
        console.log("Error: image#alumni", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/student/:studentId', passport.authenticate('jwt', {session: false}), multerUpload(
    async (req, file, cb) => {
        cb(null, `student-${req.params.studentId}`);
    }
).single('imageFile'), async (req, res, next) => {
    try {
        let imageLocation = req.file.location
        let student = await studentSchema.findOne({_id: req.params.studentId})
        student.imageURL = imageLocation
        await student.save()
        res.status(200).send({
            success: true
        })
    } catch (e) {
        console.log("Error: image#student", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/school/', passport.authenticate('jwt', {session: false}), multerUpload(
    async (req, file, cb) => {
        cb(null, `school-${req.body.schoolId}`);
    }
).single('imageFile'), async (req, res, next) => {
    try {
        let adminId = req.body.adminId
        let schoolId = req.body.schoolId
        if (!isAdmin(adminId)) {
            res.status(400).send('Invalid Admin ID');
            return;
        }
        let imageLocation = req.file.location
        let school = await schoolSchema.findOne({_id: schoolId})
        school.logoURL = imageLocation
        await school.save()
        res.status(200).send({
            success: true
        })
    } catch (e) {
        console.log("Error: image#school", e);
        res.status(500).send({'error' : e});
    }
});

module.exports = router;
