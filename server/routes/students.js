var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var checkRole = require('../utils/handlers').checkRole;
var passport = require("passport");
var sendEmail = require('./helpers/emailHelpers').sendEmail
var ObjectID = require('mongodb').ObjectID;
var uploadPdf = require('./helpers/driveHelpers').uploadPdf

const HASH_COST = 10;

router.post('/student', async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const grade = parseInt(req.body.grade);
    const phone = req.body.phone;

    const role = "STUDENT"
    const emailVerified = false
    const approved = false

    const verificationToken = crypto({length: 16});
    const passwordHash = await bcrypt.hash(req.body.password, HASH_COST);

    const courses = []
    try {
        const studentAdded = await req.db.collection("Student").insert({
            name, email, grade, phone, courses
        });
        await req.db.collection("User").insert({
            email, passwordHash, verificationToken, role, emailVerified, approved
        });
        await sendEmail(email,'noreply@school.edu','Verify Your Student Email','Email Body',verificationToken)
        res.json({
            message: 'Successfully added student',
            student: studentAdded
        });
    } catch (e) {
      console.log("Error student.js#add")
        res.status(500).json({
            message: 'Failed adding student',
            error: e
        });
    }

});

router.get('/student/:email', passport.authenticate('jwt', {session: false}), async (req,res)=>{
  const email = req.params.email
  try {
      const studentData = await req.db.collection("Student").find({email: email}).toArray();
      const userData = await req.db.collection("User").find({email: email}).toArray();
      const role = userData.role
      let message = ''
      if (!studentData.length  || !userData.length){
        message = "Record doesn't exist"
      }else{
        message = "Successfully got student details"
      }
      res.json({
          message: message,
          student: studentData,
          user: userData
      });
  }catch(e){
    console.log("Error student.js#get")
    res.status(500).json({
        message: 'Database read error',
        error: e
    });
  }

});

router.get('/status/:email', passport.authenticate('jwt', {session: false}), async (req,res)=>{
  const email = req.params.email
  try {
      const studentData = await req.db.collection("Student").find({email: email}).project({emailVerified:1,approved:1,_id:0}).toArray();
      if (studentData.length ){
      res.json({
          message: "Successfully got status",
          emailVerified: studentData[0].emailVerified,
          approved: studentData[0].approved
        });

      }
  }catch(e){
    console.log("Error student.js#status")
    res.status(500).json({
        message: "Error",
        error: e
      });

  }
});

router.get('/verification/:email/:verificationToken', async (req,res)=>{
  const email = req.params.email
  const verificationToken = req.params.verificationToken
  const dbData = await req.db.collection("User").find({email: email}).project({verificationToken:1,_id:0}).toArray();
  let success = false
  //TODO: assert dbData.length == 1
  if (dbData[0]['verificationToken'] == verificationToken){
    try{
      verificationResult = await req.db.collection("User").findAndModify({email: email},{cno:1},{"$set":{emailVerified: true}})
      res.json({
        success:true
      });
    }catch(e){
      console.log("Error student.js#verification")
      res.status(500).json({
        success:false,
        error: e
      });
    }
  }else{
    res.json({
      success:false
    });
  }

});

router.delete('/student', passport.authenticate('jwt', {session: false}), async (req,res)=>{
  email = req.body.email
  //TODO: assert email.length == 1
  try{
    await req.db.collection("Student").deleteOne({email:email})
    res.json({success: true})
  }catch(e){
    console.log("Error student.js#delete")
    res.status(500).json({Succes: false, error: e})
  }
});

router.put('/student', passport.authenticate('jwt', {session: false}), async (req,res)=>{
  const name = req.body.name
  const phone = req.body.phone
  const id = req.body.id

  try{
    await req.db.collection("Student").findAndModify({_id: ObjectID(id)},{cno:1},{"$set":{name: name,phone:phone}})
    res.json({success:true})
  }catch(e){
    console.log("Error student.js#put student")
    res.status(500).json({error: e})
  }

});

module.exports = router;
