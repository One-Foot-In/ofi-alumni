var express = require('express');
var passport = require("passport");
var router = express.Router();
var conversationSchema = require('../models/conversationSchema');
var alumniSchema = require('../models/alumniSchema');
var moment = require('moment');
const { sendNewMessageAlert } = require('./helpers/emailHelpers');
const userSchema = require('../models/userSchema');
require('mongoose').Promise = global.Promise

router.get('/', async (req, res, next) => {
    res.status(200).send({
        message: "conversations page!"
    })
})

router.post('/add/', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        const senderId = req.body.senderId;
        const recipientId = req.body.recipientId;
        const message = req.body.message;

        var conversation_instance = await conversationSchema.findOne({alumni: {$all: [senderId, recipientId]}});
        if (!conversation_instance) {
            conversation_instance = new conversationSchema(
                {
                    alumni: [senderId, recipientId],
                    messages: [],
                    seen: []
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
        
        await conversation_instance.save();
        let recipientAlumni = await alumniSchema.findById(recipientId).populate('user', 'email')
        let recipientUser = await userSchema.findById(recipientAlumni.user)
        let senderAlumnus = await alumniSchema.findById(senderId)
        let senderName = senderAlumnus.name
        // do not wait on sending email
        sendNewMessageAlert(recipientUser.email, senderName, message)
        res.status(200).send({
            message: 'Successfully added message to conversation',
            request: conversation_instance
        });
    } catch (e) {
        console.log('conversations/add Error: ' + e)
        res.status(500).send({
            message: 'Failed creating conversation: ' + e
        });
    }
});

router.get('/all/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const alumniId = req.params.id;
        var conversations = await conversationSchema.find({alumni: alumniId}).populate('alumni', 'name imageURL');
        for (let conversation of conversations) {
            conversation.timeFromMessage = moment(conversation.messages[0].dateSent).fromNow();
        }
        // filter out stale conversations, aka conversations where at least one alumnus is deleted
        // TODO: This is a bad data handling solution. Once we have nightly jobs for handling background processes,
        // this check can be removed
        conversations = conversations.filter(conversation => {
            let allAlumniExist = false
            conversation.alumni.forEach(alumnus => {
                allAlumniExist = !!alumnus.name
            })
            return allAlumniExist
        })
        res.status(200).send({
            'conversations': conversations
        });
    } catch (e) {
        console.log('conversations/all/:id Error: ' + e)
        res.status(500).send({
            message: 'Failed to fetch conversations: ' + e
        });
    }
})

router.patch('/one/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const alumniId = req.params.id;
        const conversationId = req.body.id;
        const timezone = parseInt(req.body.timezone);
        var conversation = await conversationSchema.findById(conversationId)
        
        conversation.seen.set(conversation.alumni.indexOf(alumniId), true);
        await conversation.save()

        await conversation.populate('alumni', 'name imageURL').execPopulate();
        for (let message of conversation.messages) {
            let dateSent = moment.utc(message.dateSent).add(timezone, 'h');
            message.dateString = dateSent.format('MMM D YYYY, h:mm a')
        }
        res.status(200).send({
            'conversation': conversation
        });
    } catch (e) {
        console.log('conversations/one/:id Error: ' + e)
        res.status(500).send({
            message: 'Failed to fetch conversation: ' + e
        });
    }
})

router.patch('/sendMessage/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
        const senderId = req.params.id;
        const conversationId = req.body.id;
        const message = req.body.message
        const timezone = parseInt(req.body.timezone);
        let conversation = await conversationSchema.findById(conversationId)
        
        conversation.messages.unshift({
            senderId: senderId,
            message: message
        });

        let seen = new Array(conversation.alumni.length).fill(false);
        seen[conversation.alumni.indexOf(senderId)] = true;
        conversation.seen = seen
        
        await conversation.save()
        
        await conversation.populate('alumni', '_id name imageURL user').execPopulate();
        for (let message of conversation.messages) {
            let dateSent = moment.utc(message.dateSent).add(timezone, 'h');
            message.dateString = dateSent.format('MMM D YYYY, h:mm a')
        }
        let senderAlumnus = await alumniSchema.findById(senderId)
        let senderName = senderAlumnus.name
        let recipientAlumni = conversation.alumni.filter(alumnus => {return alumnus._id.toString() !== senderId })
        // conversation can occur between multiple users
        let recipientUsers = await userSchema.find().where('_id').in(recipientAlumni.map(alumnus => alumnus.user))
        for (let recipient of recipientUsers) {
            // do not wait on sending email
            sendNewMessageAlert(recipient.email, senderName, message)
        }
        res.status(200).send({
            'conversation': conversation
        });
    } catch (e) {
        console.log('conversations/sendMessage/:id Error: ' + e)
        res.status(500).send({
            message: 'Failed to send message: ' + e
        });
    }
})

module.exports = router;
