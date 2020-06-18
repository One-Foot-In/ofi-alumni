const sg = require('@sendgrid/mail');
require('dotenv').config();

const BACKEND = process.env.BACKEND || 'http://localhost:5000'
const APP = process.env.APP || 'http://localhost:3000'
var htmlBuilder = require('./emailBodyBuilder').buildBody

// Comment out actual sendgrid call to avoid hitting free quota during testing
sg.setApiKey(process.env.SENDGRID_KEY);

const createPersonalization = (to, subject, html) => {
  return {
    to: to,
    from: {
      email: 'no-reply@onefootin.com',
      name: 'One Foot In'
    },
    subject: subject,
    html: html,
  }
}

const sendTestEmail = async (to) => {
  let emailObject = createPersonalization(to, 'Test Subject', htmlBuilder('Test Body', 'This is a title', 'Click me to go to facebook!', 'facebook.com'))
  await sg.send(emailObject, true);
}

const sendAlumniVerificationEmail = async (to, token, schoolName) => {
  let emailObject = createPersonalization(
    to,
    'Hello from One Foot In',
    htmlBuilder(
      'Please verify your email in order to login!',
      `Welcome to One Foot In's ${schoolName} Alumni Network!`,
      'Verify Email',
      `${BACKEND}/verification/${to}/${token}`
    )
  )
  // console.log("Sending email with", emailObject)
  await sg.send(emailObject, true)
}

const sendStudentVerificationEmail = async (to, token, schoolName) => {
  let emailObject = createPersonalization(
    to,
    'Hello from One Foot In',
    htmlBuilder(
      'Please verify your email in order to login!',
      `Welcome to One Foot In's ${schoolName} Student Network!`,
      'Verify Email',
      `${BACKEND}/verification/${to}/${token}`
    )
  )
  // console.log("Sending email with", emailObject)
  await sg.send(emailObject, true)
}

const sendNewRequestEmail = async (to) => {
  let emailObject = createPersonalization(
    to,
    'New Request!',
    htmlBuilder(
      'You have a new request!',
      `You have a mentee who needs your help! Please login to app to view your new requests!`,
      'Go To App',
      APP
    )
  )
  // console.log("Sending email with", emailObject)
  await sg.send(emailObject, true)
}

const sendRequestConfirmedEmail = async (menteeEmail, menteeName, menteeTime, mentorEmail, mentorName, mentorTime, topic) => {
  let emailObjectForMentee = createPersonalization(
    menteeEmail,
    'You\'re request has been confirmed!',
    htmlBuilder(
      'You\'re all set!',
      `You're set to take a call with ${mentorName} discussing ${topic}. The call is set to take place ${menteeTime}. We <b> strongly recommend </b> setting up a reminder so you don't forget the call! You can go into the app, and join the video call.`,
      'Go To App',
      APP
    )
  )
  let emailObjectForMentor = createPersonalization(
    mentorEmail,
    'You\'ve confirmed a request!',
    htmlBuilder(
      'Thank you for confirming your request!',
      `You're set to take a call with ${menteeName} discussing ${topic}. The call is set to take place ${mentorTime}. We <b> strongly recommend </b> setting up a reminder so you don't forget the call! You can go into the app, and join the video call.`,
      'Go To App',
      APP
    )
  )
  // console.log("Sending email with", emailObject)
  await sg.send(emailObjectForMentee, true)
  await sg.send(emailObjectForMentor, true)
}

exports.sendTestEmail = sendTestEmail
exports.sendAlumniVerificationEmail = sendAlumniVerificationEmail
exports.sendStudentVerificationEmail = sendStudentVerificationEmail
exports.sendNewRequestEmail = sendNewRequestEmail
exports.sendRequestConfirmedEmail = sendRequestConfirmedEmail
