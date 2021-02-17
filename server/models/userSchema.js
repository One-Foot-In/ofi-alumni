var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true},
    verificationToken: {type: String, required: true},
    passwordChangeToken: {type: String, required: false},
    role: [{type: String, required: true, enum: ['ALUMNI', 'STUDENT', 'ADMIN', 'COLLEGE_REP', 'COUNTRY_AMBASSADOR']}],
    accessContexts: [{type: String, default: ['INTRASCHOOL'], enum: ['INTRASCHOOL', 'INTERSCHOOL', 'GLOBAL']}],
    emailVerified: {type: Boolean, required: true},
    emailSubscribed: {type: Boolean, required: false},
    emailSubscriptionToken: {type: String, required: false},
    pollsQueued: [{type: Schema.Types.ObjectId, ref: 'Poll', required: false}]
  }
);

module.exports = mongoose.model('User', userSchema);