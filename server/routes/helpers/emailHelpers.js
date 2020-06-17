const sg = require('@sendgrid/mail');
require('dotenv').config();

var htmlBuilder = require('./emailBodyBuilder').buildBody

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

exports.sendTestEmail = sendTestEmail
