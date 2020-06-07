var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const interestsSchema = new Schema(
  {
    name: {type: String, required: true, unique: true},
  }
);

module.exports = mongoose.model('Interests', interestsSchema);