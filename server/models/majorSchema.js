var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const majorSchema = new Schema(
  {
    name: {type: String, required: true, unique: true},
  }
);

module.exports = mongoose.model('major', majorSchema);