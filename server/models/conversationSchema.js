var mongoose = require('mongoose');
var moment = require('moment');

const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        senderId: [{type: Schema.Types.ObjectId, ref: 'Alumni'}],
        message: {type: String, required: true},
        dateSent: {type: Date, default: moment()}
    }
)

const conversationSchema = new Schema(
    { 
        alumni: [{type: Schema.Types.ObjectId, ref: 'Alumni'}],
        messages: [messageSchema],
        seen: [{type: Boolean}],
        dateCreated: {type: Date, default: moment()}, 
    }
);

module.exports = mongoose.model('Conversations', conversationSchema);