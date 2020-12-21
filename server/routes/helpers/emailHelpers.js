const sg = require('@sendgrid/mail');
require('dotenv').config();
require('mongoose').Promise = global.Promise
var alumniSchema = require('../../models/alumniSchema');
var userSchema = require('../../models/userSchema');
var conversationSchema = require('../../models/conversationSchema');
var moment = require('moment');

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
  await sg.send(emailObject, true)
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
  await sg.send(emailObject, true)
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

/*
  @param messageCountByAlumniData <Map>
  @return <String> truncated text to be included in message body for weekly alumni messages received digest
*/
function getNewMessagesForAlumniString(messageCountByAlumniData) {
  // get names and messages counts for 3 alumni
  let messageDataStrings = []
  let i = 0, truncatedMessagesCount = 0, extraAlumniCount = 0
  for (let alumnusData in messageCountByAlumniData) {
    if (i < 3) {
      let hasOneMessage = messageCountByAlumniData[alumnusData] === 1
      messageDataStrings.push(`${messageCountByAlumniData[alumnusData]} message${hasOneMessage ? '' : 's'} from ${alumnusData}`)
    } else {
      truncatedMessagesCount += messageCountByAlumniData[alumnusData]
      extraAlumniCount++
    }
    i++
  }
  let hasOneExtraMessage =  truncatedMessagesCount === 1, hasOneExtraAlumnus = extraAlumniCount === 1
  return `You have ${messageDataStrings.join(', ')}${truncatedMessagesCount > 0 ? `, and ${truncatedMessagesCount} message${hasOneExtraMessage ? '' : 's'} from ${extraAlumniCount} other ${hasOneExtraAlumnus ? 'alumnus...' : 'alumni...'}` : ''}`
}

/*
  @param alumnus <Alumni>: Alumni object for alumni receiving the email
  @return Map
  Loops through all conversations the alumni has had in the window of last 7 days, counts messages
  from each alumni in the last 7 days and returns map of identifying alumni data string to messages count
*/
const getWeeklyMessagesSummaryForAlumni = async (alumnus) => {
  let lastWeekStartingDate = moment().subtract(7, 'd').toDate()
  let relevantConversations = await conversationSchema.find(
    {
      alumni: {$in: [alumnus._id]},
      "messages.0.dateSent": {$gte: lastWeekStartingDate}
    })
    .populate('alumni')
  let messageCountByAlumniData = {}
  relevantConversations.forEach(conversation => {
    // this approach assumes that the conversation is between 2 alumni only
    let otherAlumnus = conversation.alumni.find(alum => alum._id !== alumnus._id)
    // information to be sent in email about alumni receiving emails
    let otherAlumnisDataString = `${otherAlumnus.name} (${otherAlumnus.country}, graduated: ${otherAlumnus.gradYear})`
    let messageCountOverLastWeek = 0
    conversation.messages.forEach(message => {
      if (message.dateSent > lastWeekStartingDate && message.senderId.toString() === otherAlumnus._id.toString()) {
        messageCountOverLastWeek++
      }
    })
    messageCountByAlumniData[otherAlumnisDataString] = messageCountOverLastWeek
  })
  return messageCountByAlumniData
}

const sendAlumnusEmailDigest = async(to, alumnus, token) => {
    let weeklyMessagesForAlumnus = await getWeeklyMessagesSummaryForAlumni(alumnus)
    if (Object.entries(weeklyMessagesForAlumnus).length) {
      let alumniMessagesSummaryString = getNewMessagesForAlumniString()
      let emailObject = createPersonalization(
        to,
        'New Messages from other Alumni in last week!',
        htmlBuilder(
          `You\'ve received some messages from your fellow alumni in the last week!`,
          alumniMessagesSummaryString,
          'Go To App',
          APP,
          `${BACKEND}/unsubscribe/${to}/${token}`,
          'Click here to unsubscribe from weekly digests!'
        )
      )
      // console.log("Sending email with", emailObject)
      await sg.send(emailObject, true)
    }
}

const sendWeeklyEmailDigest = async () => {
  const allAlumni = await alumniSchema.find()
  await Promise.all(allAlumni.map(async (alumnus) => {
      const alumnusUserRecord = await userSchema.findById(alumnus.user)
      if (alumnusUserRecord.emailSubscribed) {
        await sendAlumnusEmailDigest(alumnusUserRecord.email, alumnus, alumnusUserRecord.emailSubscriptionString);
      }
  }));
  // TODO: Send weekly student email digest
}

exports.sendTestEmail = sendTestEmail
exports.sendAlumniVerificationEmail = sendAlumniVerificationEmail
exports.sendStudentVerificationEmail = sendStudentVerificationEmail
exports.sendNewRequestEmail = sendNewRequestEmail
exports.sendRequestConfirmedEmail = sendRequestConfirmedEmail
exports.sendPasswordChangeEmail = sendPasswordChangeEmail
exports.sendTemporaryPasswordEmail = sendTemporaryPasswordEmail
exports.sendWeeklyEmailDigest = sendWeeklyEmailDigest
exports.getWeeklyMessagesSummaryForAlumni = getWeeklyMessagesSummaryForAlumni
exports.getNewMessagesForAlumniString = getNewMessagesForAlumniString
