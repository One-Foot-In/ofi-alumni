var express = require('express');
var passport = require("passport");
var router = express.Router();
var conversationSchema = require('../models/conversationSchema');
require('mongoose').Promise = global.Promise

router.get('/', async (req, res, next) => {
    res.status(200).send({
        message: "conversations page!"
    })
})

router.post('/addConversation/', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const senderId = req.body.senderId;
        const recipientId = req.body.recipientId;
        const message = req.body.note;

        var conversation_instance = await conversationSchema.findOne({alumni: {$all: [senderId, recipientId]}});
        if (!conversation_instance) {
            conversation_instance = new conversationSchema(
                {
                    alumni: [senderId, recipientId],
                    messages: [],
                    seen: [],
                }
            )
        }
        conversation_instance.messages.unshift({
            senderId: senderId,
            message: message
        });
        let seen = new Array(conversation_instance.alumni.length).fill(false);
        seen[conversation_instance.alumni.indexOf(senderId)] = true;
        conversation_instance.seen = seen
        
        let insert = await conversation_instance.save();

        res.status(200).send({
            message: 'Successfully added message to conversation',
            request: conversation_instance
        });
    } catch (e) {
        console.log('request/addConversation Error: ' + e)
        res.status(500).send({
            message: 'Failed creating conversation: ' + e
        });
    }
});

module.exports = router;
