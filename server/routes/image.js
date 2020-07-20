var express = require('express');
var passport = require("passport");
var router = express.Router();
var AWS = require('aws-sdk');
var fs = require('fs');
var fileType = require('file-type');
var bluebird = require('bluebird');
var multiparty = require('multiparty');
require('dotenv').config();
var adminSchema = require('../models/adminSchema');
var schoolSchema = require('../models/schoolSchema');
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
require('mongoose').Promise = global.Promise
var bcrypt = require('bcrypt');
var moment = require('moment');

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

// abstracts function to upload a file returning a promise
const uploadFile = async (buffer, name, type) => {
const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: process.env.S3_BUCKET,
    ContentType: type.mime,
    Key: `${name}.${type.ext}`
};
return await s3.upload(params).promise();
};

async function isAdmin(id) {
    let admin = await adminSchema.findById(id)
    let alumni = await alumniSchema.findById(id).populate('user')
    return (admin !== null || (alumni && alumni.user.role.includes('ADMIN')))
}

router.post('/alumni/:alumniId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const form = new multiparty.Form();
        form.parse(req, async (error, fields, files) => {
            if (!error) {
                const path = files.imageFile[0].path;
                const buffer = fs.readFileSync(path);
                const type = await fileType.fromBuffer(buffer);
                const fileName = `alumni-${req.params.alumniId}`;
                const data = await uploadFile(buffer, fileName, type);
                let imageLocation = data.Location;
                let alumni = await alumniSchema.findOne({_id: req.params.alumniId})
                alumni.imageURL = imageLocation
                await alumni.save()
                res.status(200).send({
                    success: true
                })
            }
        })
    } catch (e) {
        console.log("Error: image#alumni", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/student/:studentId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const form = new multiparty.Form();
        form.parse(req, async (error, fields, files) => {
            if (!error) {
                const path = files.imageFile[0].path;
                const buffer = fs.readFileSync(path);
                const type = await fileType.fromBuffer(buffer);
                const fileName = `student-${req.params.studentId}`;
                const data = await uploadFile(buffer, fileName, type);
                let imageLocation = data.Location;
                let student = await studentSchema.findOne({_id: req.params.studentId})
                student.imageURL = imageLocation
                await student.save()
                res.status(200).send({
                    success: true
                })
            }
        })
    } catch (e) {
        console.log("Error: image#student", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/school/', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const form = new multiparty.Form();
        form.parse(req, async (error, fields, files) => {
            if (!error && files.imageFile) {
                let adminId = fields.adminId[0]
                let schoolId = fields.schoolId[0]
                if (!isAdmin(adminId)) {
                    res.status(400).send('Invalid Admin ID');
                    return;
                }
                const path = files.imageFile[0].path;
                const buffer = fs.readFileSync(path);
                const type = await fileType.fromBuffer(buffer);
                const fileName = `school-${schoolId}`;
                const data = await uploadFile(buffer, fileName, type);
                let imageLocation = data.Location;
                let school = await schoolSchema.findOne({_id: schoolId})
                school.logoURL = imageLocation
                await school.save()
                res.status(200).send({
                    success: true
                })
            }
        }) 
    } catch (e) {
        console.log("Error: image#school", e);
        res.status(500).send({'error' : e});
    }
});

// TODO: this potentially leaves S3 bucket being polluted with images, but these images will never be associated to any user
router.post('/add', async (req, res, next) => {
    try {
        const form = new multiparty.Form();
        form.parse(req, async (error, fields, files) => {
            if (!error) {
                const email = fields.email[0]
                const emailHash = await bcrypt.hash(email, HASH_COST);
                const path = files.imageFile[0].path;
                const buffer = fs.readFileSync(path);
                const type = await fileType.fromBuffer(buffer);
                const fileName = `${emailHash}-${moment().format('MM-DD-YYYY')}`;
                const data = await uploadFile(buffer, fileName, type);
                let imageLocation = data.Location;
                res.status(200).send({
                    success: true,
                    imageUrl: imageLocation
                })
            }
        })
    } catch (e) {
        console.log("Error: image#addImage", e);
        res.status(500).send({'error' : e});
    }
});

module.exports = router;
