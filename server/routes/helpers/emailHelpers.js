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
      `Welcome to One Foot In's ${schoolName} Alumni Network!`,
      'Please verify your email in order to login!',
      'Verify Email',
      `${BACKEND}/verification/${to}/${token}`
    )
  )
  // console.log("Sending email with", emailObject)
  console.log(`DEBUG: about to send email to ${to}`)
  await sg.send(emailObject, true)
  console.log(`DEBUG: email sent successfully to ${to}`)
}

const sendStudentVerificationEmail = async (to, token, schoolName) => {
  let emailObject = createPersonalization(
    to,
    'Hello from One Foot In',
    htmlBuilder(
      `Welcome to One Foot In's ${schoolName} Student Network!`,
      'Please verify your email in order to login!',
      'Verify Email',
      `${BACKEND}/verification/${to}/${token}`
    )
  )
  // console.log("Sending email with", emailObject)
  console.log(`DEBUG: about to send email to ${to}`)
  await sg.send(emailObject, true)
  console.log(`DEBUG: email sent successfully to ${to}`)
}

const sendNewRequestEmail = async (to) => {
  let emailObject = createPersonalization(
    to,
    'New Request!',
    htmlBuilder(
      `You have a mentee who needs your help! Please login to app to confirm your the call!`,
      'You have a new request!',
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
      `You're set to take a call with <b>${mentorName}</b> discussing <b>${topic}</b>. The call is set to take place <b>${menteeTime}</b>. We <b> strongly recommend </b> setting up a reminder so you don't forget the call! You can go into the app, and join the video call.`,
      'You\'re all set!',
      'Go To App',
      APP
    )
  )
  let emailObjectForMentor = createPersonalization(
    mentorEmail,
    'You\'ve confirmed a request!',
    htmlBuilder(
      `You're set to take a call with <b>${menteeName}</b> discussing <b>${topic}</b>. The call is set to take place <b>${mentorTime}</b>. We <b> strongly recommend </b> setting up a reminder so you don't forget the call! You can go into the app, and join the video call.`,
      'Thank you for confirming your request!',
      'Go To App',
      APP
    )
  )
  // console.log("Sending email with", emailObject)
  await sg.send(emailObjectForMentee, true)
  await sg.send(emailObjectForMentor, true)
}

const sendPasswordChangeEmail = async (to, token) => {
  let emailObject = createPersonalization(
    to,
    `You've requested to change your password.`,
    htmlBuilder(
      `We will send you a temporary password to help you login.`,
      'Forgot your password? It happens!',
      'Get temporary password',
      `${BACKEND}/tempPassword/${to}/${token}`
    )
  )
  // console.log("Sending email with", emailObject)
  await sg.send(emailObject, true)
}

const sendTemporaryPasswordEmail = async (to, tempPass) => {
  let emailObject = createPersonalization(
    to,
    `Your temporary password is here!`,
    htmlBuilder(
      `Here's your new temporary password! If you didn't request a password change, please email us at onefootincollege@gmail.com! Please change your password once you login.`,
      `Your temporary password is ${tempPass}`,
      'Go To App',
      APP
    )
  )
  // console.log("Sending email with", emailObject)
  await sg.send(emailObject, true)
}

exports.sendTestEmail = sendTestEmail
exports.sendAlumniVerificationEmail = sendAlumniVerificationEmail
exports.sendStudentVerificationEmail = sendStudentVerificationEmail
exports.sendNewRequestEmail = sendNewRequestEmail
exports.sendRequestConfirmedEmail = sendRequestConfirmedEmail
exports.sendPasswordChangeEmail = sendPasswordChangeEmail
exports.sendTemporaryPasswordEmail = sendTemporaryPasswordEmail
