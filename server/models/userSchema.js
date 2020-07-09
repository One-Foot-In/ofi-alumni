var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {type: String, reguired: true},
    passwordHash: {type: String, required: true},
    verificationToken: {type: String, required: true},
    passwordChangeToken: {type: String, required: false},
    role: [{type: String, required: true, enum: ['ALUMNI', 'STUDENT', 'ADMIN']}],
    emailVerified: {type: Boolean, required: true}
  }
);

module.exports = mongoose.model('User', userSchema);