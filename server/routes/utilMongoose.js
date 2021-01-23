var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var userSchema = require('../models/userSchema');
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var adminSchema = require('../models/adminSchema');
var requestSchema = require('../models/requestSchema');
var schoolSchema = require('../models/schoolSchema');
var collegeSchema = require('../models/collegeSchema');
var companySchema = require('../models/companySchema');
var jobTitleSchema = require('../models/jobTitleSchema');
var majorSchema = require('../models/majorSchema');
var interestsSchema = require('../models/interestsSchema');
var newsSchema = require('../models/newsSchema');
const conversationSchema = require('../models/conversationSchema');
const collegeRepSchema = require('../models/collegeRepSchema');
require('mongoose').Promise = global.Promise
var COUNTRIES = require("../countries").COUNTRIES
var sendTestEmail = require('../routes/helpers/emailHelpers').sendTestEmail

const HASH_COST = 10;

/* Integration Testing Routes */
const USER_COUNT = 20
const SCHOOL_COUNT = 3
const COLLEGE_COUNT = 10
const COMPANY_COUNT = 10
const JOB_TITLE_COUNT = 10
const MOCK_PASSWORD = 'password'

const firstNames = ["Papa", "Great", "Slick", "Hungry", "Liberal", "Conservative", "Sneaky"];
const lastNames = ["Pete", "Bear", "Besos", "X AE A-12", "Jade", "Finch", "Khaled", "Panda"];
const cities = ["St Johnsberg", "Old York City", "Khola", "San Disco", "Jelhi", "Dar es Goodbye", "Grazing"]
const professionFirst = ["Angsty", "Focused", "Bewitched", "Destitute", "Fumbling", "Grandiose", "Dextrous", "Giant", "Manual", "Thirsty", "Zoned out", "Astute"]
const professionSecond = ["Trader", "Engineer", "Painter", "Student", "Assistant", "Clerk", "Banker", "Architect", "Addict", "Surgeon", "Designer", "Tailor", "Duck"]
const companies = ["Global Business Machines", "Butt Book", "Capture Inc", "Amazon (The Rainforest)", "Chirper", "TripGuide", "Minisoft", "AT or T", "Pillow Housing", "Goldman Tax", "Tubspot"]
const majors = ["Aerospace Engineering", "Peace and Justice Studies", "Ultimate Fight Science", "Production Engineering", "Biomedical Engineering", "Music Theory", "Science of Batman", "Econometrics", "Psychology", "Finance", "Pre-med"]

const colleges = [
    "Hogwarts School of WitchCraft and Wizardry", "Elephants on the Hill", "Larvard", "Pepsodent", "Boston Institute of Technology", "Ben and Jerry's", "Lannister University",
    "Get Rich Quick College", "Gary Vee's School of Wisdom", "Tik Tok Fine Arts Institute", "Where Science Comes to Die",
    "5th best on the Red Line", "Lemmings and Family Home Schooling", "Grand Theft Auto - School of Life", "La Casa de Papel",
    "Training Academy for Hourses", "Two-way petting Zoo"
]
const schools = [
    "Zuckerberg's Privacy Bootcamp", "Elon Musk's Day Care", "Bear Grylls Cullinary Arts", "Joe Rogan's Production Engineering", "Flat Earth Geography Society", "Gengis Khan's School of Peace and Justice"
]
const countries = [
    COUNTRIES[0], COUNTRIES[5], COUNTRIES[10], COUNTRIES[15], COUNTRIES[20], COUNTRIES[25], COUNTRIES[30]
]
const timezones = [
    -1200, -1100, -1000, -900, -800, -700, -600, -500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200
]
const interests = [
    "3D Printing", "Entrepreneurship", "Sleuthing", "Quantum Computing", "Bird Watching", "Drums", "Guitar", "Social Justice", "Politics", "Community Service", "Mental Health Awareness"
]

const randomPickFromArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const createAlumni = async (_email, _name, _country, _city, _profession, _company, _college, _picLink, _hasZoom, timezone, _school, _schoolLogo, _interests, _major) => {
    const email = _email;
    const gradYear = Math.floor((Math.random() * 1000) + 2000);
    const zoomLink = _hasZoom ? 'yourZoomLink' : null;
    const password = MOCK_PASSWORD;
    const availabilities = []

    let role = ["ALUMNI"];
    if ((Math.random() * 10 + 1) >= 5) role.push("ADMIN");
    const emailVerified = true
    const approved = (Math.random() * 10 + 1) >= 5
    const verificationToken = crypto({length: 16});
    var passwordHash = await bcrypt.hash(password, HASH_COST)
    
    const user_instance = new userSchema(
        {
            email: email,
            passwordHash: passwordHash,
            verificationToken: verificationToken,
            role: role,
            emailVerified: emailVerified,
            emailSubscribed: true
        }
    );
    
    await user_instance.save();
    var alumni_instance = new alumniSchema(
        {
            name: _name,
            user: user_instance._id,
            gradYear: gradYear,
            country: _country,
            city: _city,
            jobTitle: _profession,
            jobTitleName: _profession.name,
            company: _company,
            companyName: _company.name,
            interests: _interests,
            college: _college,
            collegeName: _college.name,
            availabilities: availabilities,
            zoomLink: zoomLink,
            imageURL: _picLink,
            approved: approved,
            timeZone: timezone,
            school: _school,
            schoolLogo: _schoolLogo,
            major: _major,
            majorName: _major.name
        }
    )
    let insert = await alumni_instance.save();
}

const createStudent = async (_email, _name, _picLink, timezone, _school, _schoolLogo) => {
    const email = _email;
    const grade = Math.floor((Math.random() * 10) + 2);
    const password = MOCK_PASSWORD;

    const role = ["STUDENT"]
    const emailVerified = true
    const approved = (Math.random() * 10 + 1) >= 5
    const verificationToken = crypto({length: 16});
    var passwordHash = await bcrypt.hash(password, HASH_COST)

    const user_instance = new userSchema(
        {
          email: email,
          passwordHash: passwordHash,
          verificationToken: verificationToken,
          role: role,
          emailVerified: emailVerified,
          emailSubscribed: true
        }
    );
    await user_instance.save();

    var student_instance = new studentSchema(
        {
            name: _name,
            user: user_instance._id,
            grade: grade,
            timeZone: timezone,
            imageURL: _picLink,
            approved: approved,
            school: _school,
            schoolLogo: _schoolLogo
        }
    )
    let insert = await student_instance.save();
}

const createSchool = async (_name, _country, _logoURL) => {
    var school_instance = new schoolSchema({
        name: _name,
        country: _country,
        logoURL: _logoURL
    })
    await school_instance.save()
}

const createCollege = async (_name, _country, _logoURL) => {
    var college_instance = new collegeSchema({
        name: _name,
        country: _country,
        logoURL: _logoURL
    })
    await college_instance.save()
}

router.get('/seed/', async (req, res, next) => {
    try {
        // Create 3 schools
        for (let i = 0; i < SCHOOL_COUNT; i++) {
            const schoolName = randomPickFromArray(schools)
            const country = randomPickFromArray(countries)
            const logoUrl = `https://placedog.net/400/400?id=${Math.floor(Math.random()*20 + 1)}`
            await createSchool(schoolName, country, logoUrl)
        }
        let schoolsSaved = await schoolSchema.find()

        // create 10 colleges
        for (let i = 0; i < COLLEGE_COUNT; i++) {
            const collegeName = colleges[i]
            const country = randomPickFromArray(countries)
            const logoUrl = `https://placedog.net/400/400?id=${Math.floor(Math.random()*20 + 1)}`
            await createCollege(collegeName, country, logoUrl)
        }
        let collegesSaved = await collegeSchema.find()
        
        // create 10 companies
        for (let i = 0; i < COMPANY_COUNT; i++) {
            let company_instance = new companySchema({
                name: companies[i]
            })
            await company_instance.save()
        }
        let companiesSaved = await companySchema.find()
        // create 10 jobTitles
        for (let i = 0; i < JOB_TITLE_COUNT; i++) {
            let jobTitle_instance = new jobTitleSchema({
                name: `${randomPickFromArray(professionFirst)} ${randomPickFromArray(professionSecond)} ${i}`
            })
            await jobTitle_instance.save()
        }
        let jobTitlesSaved = await jobTitleSchema.find()
        // create majors
        for (let i = 0; i < majors.length; i++) {
            let major_instance = new majorSchema({
                name: majors[i]
            })
            await major_instance.save()
        }
        let majorsSaved = await majorSchema.find()

        // create interests
        for (let i = 0; i < interests.length; i++) {
            let interest_instance = new interestsSchema({
                name: interests[i]
            })
            await interest_instance.save()
        }
        let interestsSaved = await interestsSchema.find()

        for (let i = 0; i < USER_COUNT; i++) {
            // create mock alumni
            let school = randomPickFromArray(schoolsSaved)
            let alumniEmail = `alumni${i}@ofi.com`
            let alumniName = `${randomPickFromArray(firstNames)} ${randomPickFromArray(lastNames)}`
            let country = randomPickFromArray(countries)
            let city = randomPickFromArray(cities)
            let jobTitle = randomPickFromArray(jobTitlesSaved)
            let company = randomPickFromArray(companiesSaved)
            let interests = [randomPickFromArray(interestsSaved), randomPickFromArray(interestsSaved)]
            let picLinkAlumni = `https://placedog.net/400/400?id=${Math.floor(Math.random()*20 + 1)}`
            let college = randomPickFromArray(collegesSaved)
            let hasZoom = randomPickFromArray([true, false])
            let timezoneAlumni = randomPickFromArray(timezones)
            let major = randomPickFromArray(majorsSaved)
            await createAlumni(alumniEmail, alumniName, country, city, jobTitle, company, college, picLinkAlumni, hasZoom, timezoneAlumni, school, school.logoURL, interests, major)

            // create mock student
            let studentEmail = `student${i}@ofi.com`
            let studentName = `${randomPickFromArray(firstNames)} ${randomPickFromArray(lastNames)}`
            let picLinkStudent = `https://placedog.net/400/400?id=${Math.floor(Math.random()*20 + 1)}`
            let timezoneStudent = randomPickFromArray(timezones)
            await createStudent(studentEmail, studentName, picLinkStudent, timezoneStudent, school, school.logoURL)
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
        var dbData = await alumniSchema.findOne({_id: req.body.id})
        res.status(200).send({'alumni' : dbData});
    } catch (e) {
        console.log("Error: util#getAlumni", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/alumni/approve/:id', async (req, res, next) => {
    try {
        let alumni = await alumniSchema.findOne({_id: req.params.id})
        alumni.approved = true
        await alumni.save()
        res.status(200).send({message : `Approved alumni ${alumni.name}!`});
    } catch (e) {
        console.log("Error: util#approveAlumni", e);
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

        const role = ["ALUMNI"]
        const emailVerified = false
        const approved = false
        const verificationToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)
        const user_instance = new userSchema(
            {
              email: email,
              passwordHash: passwordHash,
              verificationToken: verificationToken,
              role: role,
              emailVerified: emailVerified,
              approved: approved,
              emailSubscribed: true
            }
        );
        await user_instance.save();

        var alumni_instance = new alumniSchema(
            {
                name: name,
                user: user_instance._id,
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
        let insert = await alumni_instance.save();

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
        var dbData = await studentSchema.findOne({_id: req.body.id})
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

        const role = ["STUDENT"]
        const emailVerified = false
        const approved = false
        const verificationToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)
        const user_instance = new userSchema(
            {
              email: email,
              passwordHash: passwordHash,
              verificationToken: verificationToken,
              role: role,
              emailVerified: emailVerified,
              emailSubscribed: true,
              approved: approved
            }
        );
        await user_instance.save();

        var student_instance = new studentSchema(
            {
                name: name,
                user: user_instance._id,
                grade: grade,
                //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
                //issuesLiked: [{type: Schema.Types.ObjectId, ref: 'issueSchema'}]
                timeZone: timeZone
            }
        )
        let insert = await student_instance.save();

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

router.get('/makeModerator/:studentId', async (req, res, next) => {
    try {
        let student = await studentSchema.findOne({_id: req.params.studentId})
        student.isModerator = true
        await student.save()
        res.status(200).send({message: `${student.name} has been made a moderator!`})
    } catch (e) {
        res.status(500).send({error: e})
    }
})

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
        const dbData = await requestSchema.find().populate('mentor')
        for (let request of dbData) {
            if (request.requesterRole === 'STUDENT') {
                request.requesterObj = await studentSchema.findOne({_id: request.requester})
            } else {
                request.requesterObj = await alumniSchema.findOne({_id: request.requester})
            }
        }
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

/* School Routes */
router.get('/allSchools', async (req, res) => {
    try {
        let schools = await schoolSchema.find()
        res.status(200).send(schools)
    } catch (e) {
        res.status(500).send({'error': e});
    }
})

/* College Routes */
router.get('/allColleges', async (req, res) => {
    try {
        let colleges = await collegeSchema.find()
        res.status(200).send(colleges)
    } catch (e) {
        res.status(500).send({'error': e});
    }
})

/* Career Routes */
router.get('/allInterests', async (req, res) => {
    try {
        let interests = await interestsSchema.find()
        res.status(200).send(interests)
    } catch (e) {
        res.status(500).send({'error': e});
    }
})

router.get('/allJobTitles', async (req, res) => {
    try {
        let jobTitles = await jobTitleSchema.find()
        res.status(200).send(jobTitles)
    } catch (e) {
        res.status(500).send({'error': e});
    }
})

router.get('/allCompanies', async (req, res) => {
    try {
        let companies = await companySchema.find()
        res.status(200).send(companies)
    } catch (e) {
        res.status(500).send({'error': e});
    }
})

/* Major Routes */
router.get('/allMajors', async (req, res) => {
    try {
        let majors = await majorSchema.find()
        res.status(200).send(majors)
    } catch (e) {
        res.status(500).send({'error': e});
    }
})

/* Newsfeed Routes */
router.get('/allNews', async (req, res) => {
    try {
        let news = await newsSchema.find()
        res.status(200).send(news)
    } catch (e) {
        res.status(500).send({'allNews error': e})
    }
})

router.get('/data/clear/news', async (req, res) => {
    try {
        let news = await newsSchema.deleteMany({})
        res.status(200).send({'message': 'deleted all news items!'})
    } catch (e) {
        res.status(500).send({'news deletion error': e})
    }
})
/* Sendgrid */

router.get('/testEmail/:email', async (req, res) => {
    try {
        let email = req.params.email
        await sendTestEmail(email)
        res.status(200).send({message: "Sent test email!"})
    } catch (e) {
        console.log(e)
        res.status(500).send({'error': e});
    }
})

/* Conversations */
router.get('/allConversations/', async (req, res) => {
    try {
        let conversations = await conversationSchema.find({}).populate('alumni')
        res.status(200).send({'conversations': conversations})
    } catch (e) {
        console.log(e)
        res.status(500).send({'error': e});
    }
})

router.get('/data/clear/conversations', async (req, res) => {
    try {
        let conversations = await conversationSchema.deleteMany({})
        res.status(200).send({'message': 'deleted all conversation items!'})
    } catch (e) {
        res.status(500).send({'conversation deletion error': e})
    }
})

/* Admin */
router.post('/newAdmin/', async (req, res) => {
    try {
        const email = req.body.email;
        const name = req.body.name;
        const timeZone = req.body.timeZone;
        const password = req.body.password;

        const role = "ADMIN"
        const emailVerified = true
        const approved = true
        const verificationToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)
        const user_instance = new userSchema(
            {
              email: email,
              passwordHash: passwordHash,
              verificationToken: verificationToken,
              role: role,
              emailVerified: emailVerified,
              emailSubscribed: true
            }
        );
        await user_instance.save();
        const admin_instance = new adminSchema(
            {
                name: name,
                timeZone: timeZone,
                user: user_instance._id,
                approved: approved
            }
        );
        await admin_instance.save();
        res.status(200).send({'New Admin': admin_instance})
    } catch (e) {
        console.log('/newAdmin error: '+ e);
        res.status(500).send({'newAdmin error': e});
    }
})

router.patch('/promoteAdmin/alumniId/', async (req, res) => {
    const alumniId = req.body.id;
    try {
        let alumni = await alumniSchema.findById(alumniId)
        let user = await userSchema.findById(alumni.user)
        let roles = user.role
        roles.push('ADMIN')
        user.role = roles
        await user.save()
        res.status(200).send({'New Admin': alumni})
    } catch (e) {
        console.log('/promoteAdmin failed ' + e.message)
        res.status(500).send({'promotion by alumniID failed': e})
    }
})

router.patch('/promoteAdmin/email/', async (req, res) => {
    const email = req.body.email;
    try {
        let user = await userSchema.findOne({email: email})
        let roles = user.role
        roles.push('ADMIN')
        user.role = roles
        await user.save()
        res.status(200).send({'New Admin': user})
    } catch (e) {
        console.log('/promoteAdmin failed ' + e.message)
        res.status(500).send({'promotion by email failed': e})
    }
})

router.patch('/promoteAdmin/userId/', async (req, res) => {
    const id = req.body.id;
    try {
        let user = await userSchema.findById(id)
        let roles = user.role
        roles.push('ADMIN')
        user.role = roles
        await user.save()
        res.status(200).send({'New Admin': user})
    } catch (e) {
        console.log('/promoteAdmin failed ' + e.message)
        res.status(500).send({'promotion by userID failed': e})
    }
})

/* College Rep */
router.get('/newCollegeRep/', async (req, res) => {
    try {
        const email = "rep@ofi.com";
        const name = "Reppy McRepFace";
        const timeZone = -400;
        const password = "p";

        const role = "COLLEGE_REP"
        const emailVerified = true
        const approved = true
        const verificationToken = crypto({length: 16});
        var passwordHash = await bcrypt.hash(password, HASH_COST)
        const college = await collegeSchema.findOne({})
        const user_instance = new userSchema(
            {
              email: email,
              passwordHash: passwordHash,
              verificationToken: verificationToken,
              role: role,
              emailVerified: emailVerified,
              emailSubscribed: true
            }
        );
        await user_instance.save();
        const collegeRep_instance = new collegeRepSchema(
            {
                name: name,
                timeZone: timeZone,
                user: user_instance._id,
                approved: approved,
                college: college._id
            }
        );
        await collegeRep_instance.save();
        res.status(200).send({'New College Rep': collegeRep_instance})
    } catch (e) {
        console.log('/newCollegeRep error: '+ e);
        res.status(500).send({'newCollegeRep error': e});
    }
})

router.get('/data/clear/collegeRep', async (req, res) => {
    try {
        let reps = await collegeRepSchema.deleteMany({})
        res.status(200).send({'message': 'deleted all college rep items!'})
    } catch (e) {
        res.status(500).send({'college rep deletion error': e})
    }
})

/* Clear All */
router.get('/data/clear/all', async (req, res, next) => {
    try {
        await alumniSchema.deleteMany({});
        await studentSchema.deleteMany({});
        await adminSchema.deleteMany({});
        await collegeRepSchema.deleteMany({})
        await userSchema.deleteMany({});
        await requestSchema.deleteMany({});
        await schoolSchema.deleteMany({});
        await collegeSchema.deleteMany({});
        await jobTitleSchema.deleteMany({});
        await interestsSchema.deleteMany({});
        await companySchema.deleteMany({});
        await newsSchema.deleteMany({});
        await majorSchema.deleteMany({});
        await conversationSchema.deleteMany({});
        res.status(200).send({'message' : 'deleted all records!'});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

module.exports = router;