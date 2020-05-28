var mongoose = require('mongoose')

const Schema = mongoose.Schema;

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
    email: {type: String, reguired: true, unique: true},
    gradYear: {type: Number, required: true},
    location: {type: String, required: false},
    profession: {type: String, required: false},
    company: {type: String, required: false},
    college: {type: String, required: false},
    //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
    //posts: [{type: Schema.Types.ObjectId, ref: 'postSchema'}]
    availabilities: [timeAvailabilitySchema],
    timeZone: {type: Number, required: false}, // value for Date.getTimezoneOffset (Daylight Savings prevents this from being constant)
    zoomLink: {type: String, required: false},
    approved: {type: Boolean, default: false}
  }
);

module.exports = mongoose.model('Alumni', alumniSchema);