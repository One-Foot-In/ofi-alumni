var mongoose = require('mongoose')

const Schema = mongoose.Schema;

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
    availabilities: [Date],
    timeZone: {type: String, required: false},
    zoomLink: String
  }
);

module.exports = mongoose.model('Alumni', alumniSchema);