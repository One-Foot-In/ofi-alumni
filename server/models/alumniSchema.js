var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const alumniSchema = new Schema(
  {
    name: {type: String, required: true},
    email: {type: String, reguired: true},
    gradYear: {type: Number, required: true},
    location: {type: String, required: true},
    profession: {type: String, required: true},
    company: {type: String, required: true},
    college: {type: String, required: true},
    //requests: [{type: Schema.Types.ObjectId, ref: 'requestSchema'}]
    //posts: [{type: Schema.Types.ObjectId, ref: 'postSchema'}]
    availabilities: [Date],
    timeZone: {type: String, required: true},
    zoomLink: String
  }
);

module.exports = mongoose.model('Alumni', alumniSchema);