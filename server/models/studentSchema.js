var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const studentSchema = new Schema(
  {
    imageURL: {type: String, default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'},
    name: {type: String, required: true},
    email: {type: String, required: true},
    grade: {type: Number, required: true},
    //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
    //issuesLiked: [{type: Schema.Types.ObjectId, ref: 'issueSchema'}]
    timeZone: {type: Number, required: false}, // value for Date.getTimezoneOffset (Daylight Savings prevents this from being constant),
    approved: {type: Boolean, default: false},
    school: {type: Schema.Types.ObjectId, ref: 'School', required: true}
  }
);

module.exports = mongoose.model('Student', studentSchema);