var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var userSchema = require('../models/userSchema');
var alumniSchema = require('../models/alumniSchema');
require('mongoose').Promise = global.Promise

const HASH_COST = 10;

router.post('/', async (req, res, next) => {
    try {
        const email = req.body.email;
        const name = req.body.name;
        const gradYear = parseInt(req.body.graduationYear);
        const location = req.body.location;
        const profession = req.body.jobTitle;
        const company = req.body.company;
        const college = req.body.college;
        const password = req.body.password;
        // TODO: need to add timeZone in frontend request
        const availabilities = [];
        const timeZone = req.body.timeZone;
        const zoomLink = req.body.zoomLink;

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
                location: location,
                profession: profession,
                company: company,
                college: college,
                //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
                //posts: [{type: Schema.Types.ObjectId, ref: 'postSchema'}]
                availabilities: availabilities,
                timeZone: timeZone,
                zoomLink: zoomLink,
                verified: true
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
        res.status(200).send({
            message: 'Successfully added alumni',
            alumni: alumni_instance
        });
    } catch (e) {
        res.status(500).send({
            message: 'Failed adding alumni: ' + e
        });
    }
});

router.get('/all', async (req, res, next) => {
    try {
        const dbData = await alumniSchema.find()
        res.json({'alumni' : dbData});
    } catch (e) {
        console.log("Error: util#allAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const dbData = await alumniSchema.findOne({_id: req.params.id})
        res.json({'result' : dbData});
    } catch (e) {
        console.log("Error: util#oneAlumni", e);
        res.status(500).send({'error' : e});
    }
});

module.exports = router;