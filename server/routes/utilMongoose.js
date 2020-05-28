var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var userSchema = require('../models/userSchema');
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var requestSchema = require('../models/requestSchema');
require('mongoose').Promise = global.Promise

const HASH_COST = 10;

/* Integration Testing Routes */
const USER_COUNT = 20
const MOCK_PASSWORD = 'password'

const firstNames = ["Papa", "Great", "Slick", "Hungry", "Liberal", "Conservative", "Sneaky"];
const lastNames = ["Pete", "Bear", "Besos", "X AE A-12", "Jade", "Finch", "Khaled", "Panda"];
const locations = ["St Petersburg", "New York City", "Dhaka, Bangladesh", "San Francisco", "Delhi, India", "Dar es Salaam, Tanzania", "Beijing, China"]
const professionFirst = ["Angsty", "Focused", "Bewitched", "Destitute", "Fumbling", "Grandiose", "Dextrous", "Giant", "Manual", "Thirsty", "Zoned out", "Astute"]
const professionSecond = ["Trader", "Engineer", "Painter", "Student", "Assistant", "Clerk", "Banker", "Architect", "Addict", "Surgeon", "Designer", "Tailor", "Duck"]
const companies = ["Global Business Machines", "Butt Book", "Capture Inc", "Amazon (The Rainforest)", "Chirper", "TripGuide", "Minisoft", "AT or T", "Pillow Housing", "Goldman Tax", "Tubspot"]
const loremPicSumIds = [
    "1", "1003", "1012", "1025", "1069", 
    "1074", "111", "169", "237", "304",
    "395", "428", "433", "45", "453",
    "50", "513", "593", "633", "660"
]
const colleges = [
    "Hogwarts School of WitchCraft and Wizardry", "Elephants on the Hill", "Larvard", "Pepsodent", "Boston Institute of Technology", "Ben and Jerry's", "Lannister University",
    "Get Rich Quick College", "Gary Vee's School of Wisdom", "Tik Tok Fine Arts Institute", "Where Science Comes to Die",
    "5th best on the Red Line", "Lemmings and Family Home Schooling", "Grand Theft Auto - School of Life", "La Casa de Papel",
    "Training Academy for Hourses", "Two-way petting Zoo"
]

const timezones = [
    -1200, -1100, -1000, -900, -800, -700, -600, -500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200
]

const randomPickFromArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const createAlumni = async (_email, _name, _location, _profession, _company, _college, _picLink, _hasZoom, timezone) => {
    const email = _email;
    const name = _name;
    const gradYear = Math.floor((Math.random() * 1000) + 2000);
    const location = _location;
    const profession = _profession;
    const company = _company;
    const college = _college;
    const zoomLink = _hasZoom ? 'yourZoomLink' : null;
    const password = MOCK_PASSWORD;
    const availabilities = []
    const picLink = _picLink;

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
            zoomLink: zoomLink,
            imageURL: picLink,
            approved: approved,
            timeZone: timezone
        }
    )
    const user_instance = new userSchema(
        {
            email: email,
            passwordHash: passwordHash,
            verificationToken: verificationToken,
            role: role,
            emailVerified: emailVerified
        }
    );
    
    let insert = await alumni_instance.save();
    await user_instance.save();
}

const createStudent = async (_email, _name, _picLink, timezone) => {
    const email = _email;
    const name = _name;
    const grade = Math.floor((Math.random() * 10) + 2);
    const password = MOCK_PASSWORD;
    const picLink = _picLink;

    const role = "STUDENT"
    const emailVerified = false
    const approved = false
    const verificationToken = crypto({length: 16});
    var passwordHash = await bcrypt.hash(password, HASH_COST)
    var student_instance = new studentSchema(
        {
            name: name,
            email: email,
            grade: grade,
            timeZone: timezone,
            //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
            //issuesLiked: [{type: Schema.Types.ObjectId, ref: 'issueSchema'}]
            imageURL: picLink
        }
    )
    const user_instance = new userSchema(
        {
          email: email,
          passwordHash: passwordHash,
          verificationToken: verificationToken,
          role: role,
          emailVerified: emailVerified
        }
    );
    
    let insert = await student_instance.save();
    await user_instance.save();
}

router.get('/seed/', async (req, res, next) => {
    try {
        for (let i = 0; i < USER_COUNT; i++) {
            // create mock alumni
            let alumniEmail = `alumni${i}@ofi.com`
            let alumniName = `${randomPickFromArray(firstNames)} ${randomPickFromArray(lastNames)}`
            let location = randomPickFromArray(locations)
            let profession = `${randomPickFromArray(professionFirst)} ${randomPickFromArray(professionSecond)}`
            let company = randomPickFromArray(companies)
            let picLinkAlumni = `https://i.picsum.photos/id/${randomPickFromArray(loremPicSumIds)}/800/800.jpg`
            let college = randomPickFromArray(colleges)
            let hasZoom = randomPickFromArray([true, false])
            let timezoneAlumni = randomPickFromArray(timezones)
            await createAlumni(alumniEmail, alumniName, location, profession, company, college, picLinkAlumni, hasZoom, timezoneAlumni)

            // create mock student
            let studentEmail = `student${i}@ofi.com`
            let studentName = `${randomPickFromArray(firstNames)} ${randomPickFromArray(lastNames)}`
            let picLinkStudent = `https://i.picsum.photos/id/${randomPickFromArray(loremPicSumIds)}/800/800.jpg`
            let timezoneStudent = randomPickFromArray(timezones)
            await createStudent(studentEmail, studentName, picLinkStudent, timezoneStudent)
        }
        res.status(200).send({'message' : `Successfully created ${USER_COUNT} alumni and ${USER_COUNT} students`});
    } catch (e) {
        console.log("Error: util#seed", e);
        res.status(500).send({'error' : e});
    }
})

/* Alumni Routes */

router.get('/alumni/', async (req, res, next) => {
    try {
        var dbData = await alumniSchema.findOne({email: req.body.email})
        res.status(200).send({'alumni' : dbData});
    } catch (e) {
        console.log("Error: util#getAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/allAlumni', async (req, res, next) => {
    try {
        const dbData = await alumniSchema.find()
        res.json({'alumnus' : dbData});
    } catch (e) {
        console.log("Error: util#allAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/addAlumni/', async (req, res, next) => {
    try {

        const email = req.body.email;
        const name = req.body.name;
        const gradYear = parseInt(req.body.gradYear);
        const location = req.body.location;
        const profession = req.body.profession;
        const company = req.body.company;
        const college = req.body.college;
        const availabilities = [];
        const timeZone = req.body.timeZone;
        const zoomLink = req.body.zoomLink;
        const password = req.body.password;

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
                zoomLink: zoomLink
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
        
        let insert = await alumni_instance.save();
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

router.get('/data/clear/alumni', async (req, res, next) => {
    try {
        await alumniSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all alumni records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

/* Student Routes */

router.get('/student/', async (req, res, next) => {
    try {
        var dbData = await studentSchema.findOne({email: req.body.email})
        res.status(200).send({'student' : dbData});
    } catch (e) {
        console.log("Error: util#getStudent", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/allStudent', async (req, res, next) => {
    try {
        const dbData = await studentSchema.find()
        res.json({'students' : dbData});
    } catch (e) {
        console.log("Error: util#allStudent", e);
        res.status(500).send({'error' : e});
    }
});

router.post('/addStudent/', async (req, res, next) => {
    try {

        const email = req.body.email;
        const name = req.body.name;
        const grade = parseInt(req.body.grade);
        const timeZone = req.body.timeZone;
        const password = req.body.password;

        const role = "STUDENT"
        const emailVerified = false
        const approved = false
        const verificationToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)
        var student_instance = new studentSchema(
            {
                name: name,
                email: email,
                grade: grade,
                //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
                //issuesLiked: [{type: Schema.Types.ObjectId, ref: 'issueSchema'}]
                timeZone: timeZone
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
        
        let insert = await student_instance.save();
        await user_instance.save();
        res.status(200).send({
            message: 'Successfully added student',
            student: student_instance
        });
    } catch (e) {
        res.status(500).send({
            message: 'Failed adding student: ' + e
        });
    }
});

router.get('/data/clear/student', async (req, res, next) => {
    try {
        await studentSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all student records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

/* User Routes */
router.get('/allUsers', async (req, res, next) => {
    try {
        const dbData = await userSchema.find();
        res.status(200).send({'allUsers' : dbData});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

router.get('/data/clear/user', async (req, res, next) => {
    try {
        await userSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all user records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

/* Request Routes */
router.get('/allRequests', async (req, res, next) => {
    try {
        const dbData = await requestSchema.find()
        res.json({'requests' : dbData});
    } catch (e) {
        console.log("Error: util#allRequests", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/populateAllRequests', async (req, res, next) => {
    try {
        const dbData = await requestSchema.find().populate('alumni').populate('student')
        res.json({'requests' : dbData});
    } catch (e) {
        console.log("Error: util#allRequests", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/data/clear/requests', async (req, res, next) => {
    try {
        await requestSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all requests'});
        
    } catch (e) {
        res.status(500).send({'error': e});
    }
});

/* Clear All */
router.get('/data/clear/all', async (req, res, next) => {
    try {
        await alumniSchema.deleteMany({});
        await studentSchema.deleteMany({});
        await userSchema.deleteMany({});
        await requestSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all records!'});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

module.exports = router;