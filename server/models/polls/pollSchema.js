var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const pollSchema = new Schema(
  {
    prompt: {type: String, required: true, max: 300},
    schoolsTargetted: [{type: Schema.Types.ObjectId, ref: 'School', required: false}], // required when poll is targetted at intraschool level
    countriesTargetted: {type: Array, required: false}, // required when poll is targetted at interschool level
    rolesTargetted: [{type: String, enum: ['ALUMNI', 'STUDENTS']}],
    allowInput: {type: Boolean, default: false},
    options: [{type: Schema.Types.ObjectId, ref: 'PollOption', required: false}] // pollOption refs
  }
);

module.exports = mongoose.model('Poll', pollSchema);