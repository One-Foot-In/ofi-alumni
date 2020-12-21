var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const actionItemSchema = new Schema(
  {
    name: {type: String, required: true, unique: true},
  }
);

module.exports = mongoose.model('ActionItem', actionItemSchema);