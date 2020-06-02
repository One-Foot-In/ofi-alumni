var mongoose = require('mongoose')
var COUNTRIES = require("../countries").COUNTRIES

const Schema = mongoose.Schema;

const studentSchema = new Schema(
  {
    logoURL: {type: String, default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', required: false},
    name: {type: String, required: true, unique: true},
    country: {type: String, enum: COUNTRIES, required: true},
  }
);

module.exports = mongoose.model('College', studentSchema);