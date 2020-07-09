var express = require('express');
var router = express.Router();
var passport = require("passport");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto-random-string');
var alumniSchema = require('../models/alumniSchema');
var studentSchema = require('../models/studentSchema');
var userSchema = require('../models/userSchema');
var timezoneHelpers = require("../helpers/timezoneHelpers")
var htmlBuilder = require("./helpers/emailBodyBuilder").buildBody
require('dotenv').config();
var sendPasswordChangeEmail = require('./helpers/emailHelpers').sendPasswordChangeEmail
var sendTemporaryPasswordEmail = require('./helpers/emailHelpers').sendTemporaryPasswordEmail

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
            let userRole = user.role && user.role.map(role => {
              return role.toUpperCase()
            })
            if (userRole[0] === "ALUMNI") {
              const alumni = await alumniSchema.findOne({user: user._id})
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
            } else if (userRole[0] === "STUDENT") {
              const student = await studentSchema.findOne({user: user._id});
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
  } catch(e) {
    console.log("Error index.js#verification", e)
    res.status(500).json(e)
  }

});

router.post('/password/change', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try {
    const password = req.body.newPassword
    const email = req.body.email
    const passwordHash = await bcrypt.hash(password, HASH_COST);
    let user = await userSchema.findOne({email: email})
    user.passwordHash = passwordHash
    await user.save()
    res.status(200).send({message: 'Successfully changed password!'})
  } catch(e) {
    console.log("Error index.js#password/change", e)
    res.status(500).send({success:false, error: e})
  }
});

router.post('/password/forgot', async (req, res, next) => {
  try {
    let email = req.body.email
    let user = await userSchema.findOne({email: email})
    let passwordChangeToken = crypto({length: 16})
    user.passwordChangeToken = passwordChangeToken;
    await user.save()
    await sendPasswordChangeEmail(email, passwordChangeToken)
    res.status(200).send({message: 'We have sent you an email with further instructions!'})
  } catch (e) {
    console.log("Error index.js#password/change", e)
    res.status(500).json(e)
  }
});

router.get('/tempPassword/:to/:token', async (req, res, next) => {
  try {
    let email = req.params.to
    let passwordChangeToken = req.params.token
    var user = await userSchema.findOne({'email': email});
    if (!user) {
      res.status(404).send({message: 'Could not find a user with given email!'})
    }
    if (passwordChangeToken === user.passwordChangeToken) {
      let newTempPass = crypto({length: 10})
    let passwordHash = await bcrypt.hash(newTempPass, HASH_COST)
      user.passwordHash = passwordHash
      await user.save()
      await sendTemporaryPasswordEmail(email, newTempPass)
      res.status(200).send(htmlBuilder('Thanks!', 'Thank you for verifying your request for a password change! We will send you an email with a temporary password shortly.', 'Go To App', APP_LINK))
    } else {
      res.status(500).send(htmlBuilder('Whoops!', 'Your password change token could not be verified. Please contact support at onefootincollege@gmail.com', 'Go To App', APP_LINK))
    }
  } catch(e) {
    console.log("Error index.js#tempPassword", e)
    res.status(500).json(e)
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
