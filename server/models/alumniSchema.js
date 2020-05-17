var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const alumniSchema = new Schema(
  {
    imageURL: {type: String, default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'},
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