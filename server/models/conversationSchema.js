var mongoose = require('mongoose');
var moment = require('moment');

const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        senderId: [{type: Schema.Types.ObjectId, ref: 'Alumni'}],
        message: {type: String, required: true},
        dateSent: {type: Date, default: () => moment()},
        //RETURN FIELD NOT KEPT IN DB
        dateString: {type: String}
    }
)

const conversationSchema = new Schema(
    { 
        alumni: [{type: Schema.Types.ObjectId, ref: 'Alumni'}],
        messages: [messageSchema],
        seen: [{type: Boolean}],
        dateCreated: {type: Date, default: () => moment()},
        //RETURN FIELD NOT KEPT IN DB
        timeFromMessage: {type: String}
    }
);

module.exports = mongoose.model('Conversations', conversationSchema);