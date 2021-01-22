var mongoose = require('mongoose')

const Schema = mongoose.Schema;
var COUNTRIES = require("../countries").COUNTRIES

/*
  All Time Availabilities are to be stored in GMT+0 timezone
  Example record
  {
    id: 'Sunday-400',
    day: 'Sunday',
    time: 400
  }
*/
const timeAvailabilitySchema = new Schema({
  id: {type: String, required: true},
  day: {type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  time: {type: Number, required: true}
})

const alumniSchema = new Schema(
  {
    imageURL: {type: String, default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'},
    name: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    gradYear: {type: Number, required: true},
    country: {type: String, enum: COUNTRIES, required: true},
    city: {type: String, required: true},
    company: {type: Schema.Types.ObjectId, ref: 'Company', required: false},
    companyName: {type: String, required: false}, // to avoid lookup for display purposes
    jobTitle: {type: Schema.Types.ObjectId, ref: 'JobTitle', required: false},
    jobTitleName: {type: String, required: false}, // to avoid lookup for display purposes
    college: {type: Schema.Types.ObjectId, ref: 'College', required: true},
    collegeName: {type: String, required: true}, // to avoid lookup for display purposes
    interests: {type: Array, required: false},
    //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
    //posts: [{type: Schema.Types.ObjectId, ref: 'postSchema'}]
    availabilities: [timeAvailabilitySchema],
    topics: {type: Array, required: false},
    timeZone: {type: Number, required: false}, // value for Date.getTimezoneOffset (Daylight Savings prevents this from being constant)
    zoomLink: {type: String, required: false},
    approved: {type: Boolean, default: false},
    school: {type: Schema.Types.ObjectId, ref: 'School', required: true},
    schoolLogo: {type: String, default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'},
    major: {type: Schema.Types.ObjectId, ref: 'Major', required: true},
    majorName: {type: String, required: true}, // to avoid lookup for display purposes
    collegesAcceptedInto: [{type: Schema.Types.ObjectId, ref: 'College', required: false}]
  }
);

module.exports = mongoose.model('Alumni', alumniSchema);