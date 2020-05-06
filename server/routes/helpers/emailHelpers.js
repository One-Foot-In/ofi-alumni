const sg = require('@sendgrid/mail');
require('dotenv').config();

sg.setApiKey(process.env.SENDGRID_KEY);

const sendEmail = (emails, from, subject, body, html) => {
  // TODO: Include name in SendGrid personalization and move from to .env
  const msg = {
    to: emails,
    from: from,
    subject: subject,
    text: body,
    html: html,
  };
  console.log("Email is being sent to", emails);
  // TODO: uncomment when email is needed
  // sg.send(msg,true);
}

exports.sendEmail = sendEmail
