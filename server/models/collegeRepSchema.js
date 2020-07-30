var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const collegeRepSchema = new Schema(
  {
    name: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    timeZone: {type: Number, required: false}, // value for Date.getTimezoneOffset (Daylight Savings prevents this from being constant)
    college: {type: Schema.Types.ObjectId, ref: 'College', required: true},
    approved: {type: Boolean, default: false},
  }
);

module.exports = mongoose.model('CollegeRep', collegeRepSchema);