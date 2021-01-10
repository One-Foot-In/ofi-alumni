var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const opportunitySchema = new Schema(
  {
    owner: {type: Schema.Types.ObjectId, ref: 'Alumni', required: true},  
    description: {type: String, required: true, max: 300},
    interests: {type: Array, required: false},
    deadline: {type: Date, required: false},
    link: {type: String, required: false}
  }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);