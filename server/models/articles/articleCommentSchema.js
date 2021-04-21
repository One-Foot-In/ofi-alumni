var mongoose = require('mongoose')
var moment = require('moment');

const Schema = mongoose.Schema;

const articleCommentSchema = new Schema(
  {
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    dateCreated: {type: Date, default: () => moment()},
    comment: {type: String, required: true, maxlength: 500},
  }
);

module.exports = mongoose.model('ArticleComment', articleCommentSchema);