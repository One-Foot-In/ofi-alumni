var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    name: {type: String, required: true, unique: true},
  }
);

module.exports = mongoose.model('Company', companySchema);