var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const pollOptionSchema = new Schema(
  {
    optionText: {type: String, required: true},
    responders: {type: Array, default: []}, // all users who have responded to the poll option
    isCustom: {type: Boolean, default: false}
  }
);

module.exports = mongoose.model('PollOption', pollOptionSchema);