var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const jobTitleSchema = new Schema(
  {
    name: {type: String, required: true, unique: true},
  }
);

module.exports = mongoose.model('JobTitle', jobTitleSchema);