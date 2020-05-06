var express = require('express');
var router = express.Router();
var crypto = require('crypto-random-string');
var bcrypt = require('bcrypt');
var passport = require("passport");
var sendEmail = require('./helpers/emailHelpers').sendEmail
var ObjectID = require('mongodb').ObjectID;
var createCourseFolder = require('./helpers/driveHelpers').createCourseFolder
var deleteFile = require('./helpers/driveHelpers').deleteFile

const HASH_COST = 10;

router.post('/add', async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const emailVerified = false;
    const approved = false;
    const role = "staff"
    const verificationToken = crypto({length: 16});
    const passwordHash = await bcrypt.hash(req.body.password, HASH_COST);
    try {
        //TODO: check if email is already in database
        const staffAdded = await req.db.collection("Staff").insert({
            name, email, phone
        });
        await req.db.collection("User").insert({
            email, passwordHash, role, verificationToken,emailVerified, approved
        });
        res.json({
            message: 'Successfully added '+ role,
            staff: staffAdded   //TODO: filter staffAdded to return only needed info
        });
        await sendEmail(email,'noreply@school.edu','Verify Your Staff Email','Email Body',verificationToken)
    } catch (e) {
        console.log("Error staff.js#add")
        res.status(500).json({
            message: 'Failed adding' + role,
            error: e
        });
    }

});

router.get('verification/:email/:verificationToken', async (req,res)=>{
  const email = req.params.email
  const verificationToken = req.params.verificationToken
  const dbData = await req.db.collection("User").find({email: email}).project({verificationToken:1,_id:0}).toArray();
  let success = false
  if (dbData[0]['verificationToken'] == verificationToken){
    try{
      verificationResult = await req.db.collection("User").findAndModify({email: email},{cno:1},{"$set":{emailVerified: true}})
      res.json({
        success:true
      });
    }catch(e){
      console.log("Error staff.js#verification/:email/:verificationToken")
      res.status(500).json({
        success:false,
        error:e
      });

    }
  }
});

router.post('/sendMessages', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const grades = req.body.grades.map(e=>parseInt(e));
    const subject = req.body.subject;
    const body = req.body.body;

    //TODO: body and html
    try {
        const dbData = await req.db.collection("Student").find({grade: {$in:grades}}).project({email:1, _id:0}).toArray();
        await sendEmail(dbData, email_from, subject, body, 'TODO');
        res.json({
          message:'success'
        })

    } catch (e) {
        console.log("Error staff.js#sendMessages")
        res.status(500).json({
            message: 'Failed',
            error: e
        });
    }

});

router.post('/sendMessage', passport.authenticate('jwt', {session: false}), async (req, res) => {
  email = req.body.email
  msg = req.body.message
  from = 'TODO@todo.todo'

  try{
    await sendEmail(email,from,subject,msg,'TODO');
    res.json({
      message:'success'
    })
  }catch(e){
    console.log("Error staff.js#sendMessage")
    res.status(500).json({
      message:'Failure',
      error: e
    })
  }


});

// TODO: Create APIs to invite students and alumni
router.post('/invite/students', passport.authenticate('jwt', {session: false}), async (req,res)=>{
  emails = req.body.emails
  grade = req.body.grade
  const role = "student"
  const emailVerified = false
  const approved = true
  //TODO: check if emails already exist in database
  //TODO: use sendgrid to validate emails
  //TODO: assert all lengths equal
  const tempPasswords = Array(emails.length).fill(null).map(x=>crypto({length: 16}))
  emails_dict = emails.map(x=>{return {email:x}})
  users_dict = emails.map((x,i)=>{return {email:x,verificationToken:crypto({length: 16}),role:role, approved:approved, emailVerified:emailVerified, passwordHash:tempPasswords[i]}})

  try{
    // Needs to update collection
    await req.db.collection('Student').insertMany(emails_dict)
    await req.db.collection("User").insertMany(users_dict)

    emails.forEach(async (email,i)=>{
        await sendEmail(email,'noreply@school.edu','You Were Added As a Student','Email Body',tempPasswords[i])
    })

    res.json({
        message: 'Successfully invited students',
        student: emails
    });
  }catch(e){
    console.log("Error staff.js#invite/students")
    res.status(500).json({
        message: 'Failed inviting students',
        error: e
    });
  }

});

// TODO: add route students/:grade to get all students of specific grade
// TODO: add get for alumni
router.get('/alumni', passport.authenticate('jwt', {session: false}), async (req,res)=>{

  try {
      const dbData = await req.db.collection("Student").find().toArray();
      res.json({
          message: 'Successfully got student records',
          students: dbData
      });
  }catch(e){
    console.log("Error staff.js#students")
    res.status(500).json({
        message: 'Failed to get student records',
        error: e
    });
  }

});

router.get('/get/:email', passport.authenticate('jwt', {session: false}), async (req,res)=>{
  const email = req.params.email
  try {
      const staffData = await req.db.collection("Staff").find({email: email}).toArray();
      const userData = await req.db.collection("User").find({email: email}).toArray();
      const role = userData.role
      let message = ''
      if (!staffData.length  || !userData.length){
        message = "Record doesn't exist"
      }else{
        message = "Successfully got staff details"
      }
      res.json({
          message: message,
          staff: staffData,
          user: userData
      });
  }catch(e){
    console.log("Error staff.js#get")
    res.status(500).json({
        message: 'Database read error',
        error: e
    });
  }

});

router.get('/status/:email', passport.authenticate('jwt', {session: false}), async (req,res)=>{
  const email = req.params.email
  try {
      const staffData = await req.db.collection("Staff").find({email: email}).project({emailVerified:1,approved:1,_id:0}).toArray();
      if (staffData.length ){
      res.json({
          message: "Successfully got status",
          emailVerified: staffData[0].emailVerified,
          approved: staffData[0].approved
        });

      }
  }catch(e){
    console.log("Error staff.js#status")
    res.status(500).json({
        message: "Error",
        error: e
      });

  }
});

router.post('/approve', async (req,res)=>{
  const approved = req.body.approved
  const email = req.body.email

  try{
    const dbData = await req.db.collection("User").updateOne({email: email},{$set:{approved:approved}});
    //TODO send email to confirm account verification
    res.json({success:true})

  }catch(e){
    console.log("Error staff.js#approve")
    res.status(500).json({success:false, error: e})
  }
});

router.delete('/student/:emailToDelete', async (req,res)=>{
  const email = req.params.emailToDelete

  try{
    await req.db.collection("User").remove({email: email});
    await req.db.collection("Student").remove({email: email});
    //TODO send email to confirm account verification
    res.json({success:true})

  }catch(e){
    console.log("Error staff.js#/student/delete", e)
    res.status(500).json({success:false, error: e})
  }
});

router.get('/pending/:role', async (req,res)=>{
  let role = req.params.role
  // TODO update roles
  let collection = ''
  if (role === "teachers") { role = "TEACHER" ; collection = "Teacher" }
  else if (role === "students") { role = "STUDENT" ; collection = "Student" }
  //else if (role == "staff") { role = "STAFF" ; collection = "Staff" }

  try{
    const userData = await req.db.collection("User").find({role:role, approved:false}).project({_id:0,email:1}).toArray()
    const emails = userData.map(e=>e.email)
    const roleData = await req.db.collection(collection).find({email: {$in:emails}}).toArray()
    res.json({data:roleData})
  }catch(e){
    console.log(e)
    res.status(500).json({error:e})
  }

})

module.exports = router;
