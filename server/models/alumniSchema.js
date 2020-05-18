var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const alumniSchema = new Schema(
  {
    name: {type: String, required: true},
    email: {type: String, reguired: true, unique: true},
    gradYear: {type: Number, required: true},
    location: {type: String, required: false},
    profession: {type: String, required: false},
    company: {type: String, required: false},
    college: {type: String, required: false},
    //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
    //posts: [{type: Schema.Types.ObjectId, ref: 'postSchema'}]
    availabilities: [Date],
    timeZone: {type: String, required: false},
    zoomLink: String
  }
);

module.exports = mongoose.model('Alumni', alumniSchema);