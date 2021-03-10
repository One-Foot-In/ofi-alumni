var mongoose = require('mongoose')
var moment = require('moment');

const Schema = mongoose.Schema;

const articleInputSchema = new Schema(
  {
    author: {type: Schema.Types.ObjectId, ref: 'Alumni', required: true},
    dateCreated: {type: Date, default: () => moment()},
    input: {type: String, required: true, maxlength: 500},
    isAnonymous: {type: Boolean, default: false},
    comments: [{type: Schema.Types.ObjectId, ref: 'ArticleComment', required: false}],
    usersLiked: [{type: Schema.Types.ObjectId, ref: 'User', required: false}],
  }
);

module.exports = mongoose.model('ArticleInput', articleInputSchema);