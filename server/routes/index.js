var express = require('express');
var router = express.Router();
var passport = require("passport");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto-random-string');
var sendEmail = require('./helpers/emailHelpers').sendEmail
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var userSchema = require('../models/userSchema');
var timezoneHelpers = require("../helpers/timezoneHelpers")
var htmlBuilder = require("./helpers/emailBodyBuilder").buildBody
require('dotenv').config();

const APP_LINK = process.env.APP || 'http://localhost:3000/'

const HASH_COST = 10;

const JWT_SECRET = process.env.JWT_SECRET || 'secret_sauce';
const JWT_EXPIRATION_MS = process.env.JWT_EXPIRATION_MS || '25000000'; // > 6 hrs;

router.get('/', function(req, res, next) {
  res.status(200).send("This is the index page!");
});

router.get('/logout', (req, res, next) => {
  try {
    res.clearCookie('jwt');
    res.json({message: "Logout successful."})
  } catch (e) {
    console.log("Error: logout", e);
    res.status(500).json({message: 'Failed to clear cookie.'})
  }
});

// login route
router.post('/login', (req, res, next) => {
  passport.authenticate(
    'local',
    (error, user, info) => {
      if (error) {
        next(error);
      } else if (!user) {
        next("User not found.")
      } else {
        var payload = {
          role: user.role,
          expires: Date.now() + parseInt(JWT_EXPIRATION_MS),
        };
        req.login(payload, {session: false}, async (error) => {
          if (error) {
            return next(error);
          }
          try {
            let userRole = user.role && user.role.toUpperCase()
            if (userRole === "ALUMNI") {
              const alumni = await alumniSchema.findOne({email: user.email});
              payload.id = alumni._id
              const cookie = jwt.sign(JSON.stringify(payload), JWT_SECRET);
              // set jwt-signed cookie on response
              alumni.availabilities = timezoneHelpers.applyTimezone(alumni.availabilities, alumni.timeZone)
              res.cookie('jwt', cookie);
              res.status(200).send(
                {
                  role: userRole,
                  details: alumni
                }
              );
            } else if (userRole === "STUDENT") {
              const student = await studentSchema.findOne({email: user.email});
              payload.id = student._id
              const cookie = jwt.sign(JSON.stringify(payload), JWT_SECRET);
              // set jwt-signed cookie on response
              res.cookie('jwt', cookie);
              res.status(200).send(
                {
                  role: userRole,
                  details: student
                }
              );
            } else {
              res.status(500).send({error: true, message: 'Could not determine role.'});
            }
          } catch (e) {
            console.log("Error: error fetching user after authentication", e);
            res.status(500).send({ error: e });
          }
        });
      }
    })(req, res)
});

router.get('/verification/:email/:verificationToken', async (req, res, next) => {
  const email = req.params.email
  const verificationToken = req.params.verificationToken
  try{
    var user = await userSchema.findOne({'email': email});
    if (verificationToken === user.verificationToken) {
      user.emailVerified = true;
      await user.save()
      res.status(200).send(htmlBuilder('Welcome aboard!', 'Thank you for verifying your email!', 'Go To App', APP_LINK))
    } else {
      res.status(500).send({message: 'Your token could not be verified!'})
    }
  }catch(e){
    console.log("Error index.js#verification", e)
    res.status(500).json(e)
  }

});

router.post('/password/change', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  const password = req.body.newPassword
  const email = req.body.email
  const passwordHash = await bcrypt.hash(password, HASH_COST);
  try{
    const dbData = await req.db.collection("User").updateOne({email: email},{$set:{passwordHash:passwordHash}});
    res.json({Success:true})
  }catch(e){
    console.log("Error index.js#password/change")
    res.status(500).json({Success:false, error: e})
  }
});

router.post('/password/forgot', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  const email = req.body.email
  const newTempPass = crypto({length: 16});
  try{
    const dbData = await req.db.collection("User").updateOne({email: email},{$set:{passwordHash:newTempPass}});
    await sendEmail(email,'noreply@school.edu','Your Password Was Reset','Email Body',newTempPass)
    res.json({Success:true})
  }catch(e){
    console.log("Error index.js#password/forgot")
    res.status(500).json({Success:false, error: e})
  }
});

router.get('/isLoggedIn', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  res.json({message: "You have a fresh cookie!"});
});

router.patch('/changeTimeZone/', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  let id = req.body.id
  let role = req.body.role
  let newTimeZone = req.body.timeZone
  let profile;

  try {
    if (role === "STUDENT") {
      let profile = await studentSchema.findById(id)
      profile.timeZone = newTimeZone
      await profile.save();
    } else {
      let profile = await alumniSchema.findById(id)
      profile.timeZone = newTimeZone
      await profile.save();
    }
    res.status(200).send({userDetails: profile})
  } catch (e) {
    console.log("Change time zone error" + e)
    res.status(500).send({message: "change time zone error" + e})
  }
})

/*
  LinkedIn API
*/

function requestAccessToken(code, state) {
  return request.post('https://www.linkedin.com/oauth/v2/accessToken')
    .send('grant_type=authorization_code')
    .send(`redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}`)
    .send(`client_id=${process.env.LINKEDIN_CLIENT_ID}`)
    .send(`client_secret=${process.env.LINKEDIN_CLIENT_SECRET}`)
    .send(`code=${code}`)
    .send(`state=${state}`)
}

function requestProfile(token) {
  /*
    Other fields available via projection are firstName, lastName, and id
  */
  return request.get('https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~digitalmediaAsset:playableStreams))')
  .set('Authorization', `Bearer ${token}`)
}

// end-point configured as callback for LinkedIn App
router.get('/linkedin', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  // state is the email address of member
  requestAccessToken(req.query.code, req.query.state)
  .then((response) => {
    requestProfile(response.body.access_token)
    .then(response => {
      // TODO: we can find user record by email provide as query param,
      // and update imageLink for corresponding student/alumnus record
      const displayImageLinkLarge = response.body.profilePicture
        && response.body.profilePicture['displayImage~']
        && response.body.profilePicture['displayImage~'].elements[3].identifiers[0].identifier
      res.status(200).send({message: "Extracted Profile Image!", displayImageLinkLarge: displayImageLinkLarge, email: req.query.state})
    })
  })
  .catch((error) => {
    res.send(`${error}`)
  })
})

/*
  LinkedIn API
*/

module.exports = router;
