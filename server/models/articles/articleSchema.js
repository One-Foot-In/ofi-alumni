var mongoose = require('mongoose')
var moment = require('moment');

const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    prompt: {type: String, maxlength: 300, required: true},
    dateCreated: {type: Date, default: () => moment()},
    school: {type: Schema.Types.ObjectId, ref: 'School', required: false},
    inputs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ArticleInput',
            required: false
        }
    ]
  }
);

module.exports = mongoose.model('Article', articleSchema);