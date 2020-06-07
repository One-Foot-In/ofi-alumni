var COUNTRIES = require("../countries").COUNTRIES
var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const schoolSchema = new Schema(
  {
    // TODO: update logoURL
    logoURL: {type: String, default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'},
    name: {type: String, required: true},
    country: {type: String, enum: COUNTRIES, required: true}
  }
);

module.exports = mongoose.model('School', schoolSchema);