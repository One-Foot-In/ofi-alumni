var express = require('express');
var router = express.Router();
var passport = require("passport");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto-random-string');
var sendEmail = require('./helpers/emailHelpers').sendEmail
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var request = require('superagent')
require('dotenv').config();

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
          email: user.email,
          role: user.role,
          expires: Date.now() + parseInt(JWT_EXPIRATION_MS),
        };
        const cookie = jwt.sign(JSON.stringify(payload), JWT_SECRET);
        // set jwt-signed cookie on response
        res.cookie('jwt', cookie);
        req.login(payload, {session: false}, async (error) => {
          if (error) {
            return next(error);
          }
          try {
            let userRole = user.role && user.role.toUpperCase()
            if (userRole === "ALUMNI") {
              const alumni = await alumniSchema.findOne({email: user.email});
              res.status(200).send(
                {
                  role: userRole,
                  details: alumni
                }
              );
            } else if (userRole === "STUDENT") {
              const student = await studentSchema.findOne({email: user.email});
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
    const dbData = await req.db.collection("User").find({email: email}).project({verificationToken:1,_id:0}).toArray();
    if (verificationToken == dbData[0]['verificationToken']){
      await req.db.collection("Student").updateOne({email: email},{$set:{approved:approve}});
      res.json({Success:true})
    }else{
      res.json({Success:false})
    }
  }catch(e){
    console.log("Error index.js#verification")
    res.status(500).json({Success:false, error:e})
  }

});

router.post('/password/change', async (req, res, next) => {
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

router.post('/password/forgot', async (req, res, next) => {
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
router.get('/linkedin', (req, res, next) => {
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
