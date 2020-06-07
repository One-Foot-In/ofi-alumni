var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var fs = require('fs');
var fileType = require('file-type');
var bluebird = require('bluebird');
var multiparty = require('multiparty');
require('dotenv').config();
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
require('mongoose').Promise = global.Promise

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

router.post('/alumni/:alumniId', async (req, res, next) => {
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

router.post('/student/:studentId', async (req, res, next) => {
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

module.exports = router;
