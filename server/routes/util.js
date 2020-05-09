var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');

// TODO: set up utils to reflect new types of roles

const HASH_COST = 10;

router.get('/testConnection', function(req, res, next) {
    try {
        res.status(200).send({'message':'connection is working!'});
    } catch (e) {
        console.log("Error: util#testConnection", e);
    }
  });

router.get('/getStudent/:email', async (req, res, next) => {
    try {
        const dbData = await req.db.collection("Student").findOne({email: req.params.email})
        res.status(200).send({'student' : dbData});
    } catch (e) {
        console.log("Error: util#getStudent", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/allStudents', async (req, res, next) => {
    try {
        const dbData = await req.db.collection("Student").find().toArray()
        res.json({'students' : dbData});
    } catch (e) {
        console.log("Error: util#allStudents", e);
        res.status(500).send({'error' : e});
    }
});

router.get('/addStudent/:name/:email/:grade/:phone/:password', async (req, res, next) => {
    try {
        const email = req.params.email;
        const name = req.params.name;
        const grade = parseInt(req.params.grade);
        const phone = req.params.phone;
        const password = req.params.password;

        const role = "STUDENT"
        const emailVerified = false
        const approved = false
        const verificationToken = crypto({length: 16});
        const passwordHash = await bcrypt.hash(password, HASH_COST);
        const studentAdded = await req.db.collection("Student").insert({
            name, email, grade, phone
        });
        await req.db.collection("User").insert({
            email, passwordHash, verificationToken, role, emailVerified, approved
        });
        res.status(200).send({
            message: 'Successfully added student',
            student: studentAdded
        });
    } catch (e) {
        res.status(500).send({
            message: 'Failed adding student' + e
        });
    }
});

router.get('/allUsers', async (req, res, next) => {
    try {
        const dbData = await req.db.collection("User").find().toArray();
        res.status(200).send({'allUsers' : dbData});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

router.get('/data/clear/all', async (req, res, next) => {
    try {
        await req.db.collection("Staff").remove({});
        await req.db.collection("User").remove({});
        res.status(200).send({'message' : 'deleted all records!'});
    } catch (e) {
        res.status(500).send({'error' : e});
    }
});

router.get('/data/clear/student', async (req, res, next) => {
    try {
        await req.db.collection("Student").remove({});
        res.status(200).send({'message' : 'deleted all student records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

router.get('/data/clear/user', async (req, res, next) => {
    try {
        await req.db.collection("User").remove({});
        res.status(200).send({'message' : 'deleted all user records!'});
    } catch (e) {
        res.status(500).send({error: e})
    }
});

module.exports = router;
