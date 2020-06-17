const sg = require('@sendgrid/mail');
require('dotenv').config();

const BACKEND = process.env.BACKEND || 'https://localhost:5000'
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

exports.sendTestEmail = sendTestEmail
exports.sendAlumniVerificationEmail = sendAlumniVerificationEmail
exports.sendStudentVerificationEmail = sendStudentVerificationEmail
