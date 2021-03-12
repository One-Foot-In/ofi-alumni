var express = require('express');
var passport = require("passport");
var moment = require('moment');
var router = express.Router();
var articleSchema = require('../models/articles/articleSchema');
var userSchema = require('../models/userSchema');
const articleInputSchema = require('../models/articles/articleInputSchema');
const articleCommentSchema = require('../models/articles/articleCommentSchema');
var newsSchema = require('../models/newsSchema');

require('mongoose').Promise = global.Promise

var logger = require("../logging");
const alumniSchema = require('../models/alumniSchema');
const studentSchema = require('../models/studentSchema');
const { FOOTY_POINTS_CHART } = require('../footyPointsChart');

const userCanAddInput = async (userId) => {
    let user = await alumniSchema.find({user : userId})
    return !!user
}

const getAuthorFromUser = async (userId) => {
    let profile = await alumniSchema.findOne({user: userId})
    if (profile) {
        return {
            name: profile.name,
            role: 'ALUMNUS',
            imageLink: profile.imageURL,
            jobTitle: profile.jobTitleName,
            major: profile.majorName,
            college: profile.collegeName,
            country: profile.country
        }
    }
    profile = await studentSchema.findOne({user: userId})
    return {
        name: profile.name,
        role: 'STUDENT',
        imageLink: profile.imageURL
    }
}

router.get('/:userId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        /**
         * Add check to see if user has access to article later
         */
        logger.info(`GET | action=/articles | userId=${req.params.userId} | message='User fetching articles'`)
        let articles = await articleSchema.find({}).populate('inputs').populate('author')
        let articleObjects = []
        for (let article of articles) {
            let articleObject = article.toObject()
            articleObject.author = await getAuthorFromUser(article.author)
            articleObject.totalComments = 0
            articleObject.totalLikes = 0
            for (let input of article.inputs) {
                await input.populate('comments').execPopulate()
                articleObject.totalComments += input.comments ? input.comments.length : 0
                articleObject.totalLikes += input.usersLiked ? input.usersLiked.length : 0
            }
            articleObjects.push(articleObject)
        }
        res.status(200).json({
            articles: articleObjects
        })
    } catch (e) {
        logger.error(`GET | action=/articles | userId=${req.params.userId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.get('/:userId/:articleId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        /**
         * Add check to see if user has access to article later
         */
        logger.info(`GET | action=/articles/ | userId=${req.params.userId} | articleId=${req.params.articleId} | message='User viewed article'`)
        let article = await articleSchema.findById(req.params.articleId).populate('inputs').populate('author')
        let articleObject = article.toObject()
        articleObject.author = await getAuthorFromUser(article.author)
        let inputObjects = []
        for (let input of article.inputs) {
            await input.populate('comments').execPopulate()
            if (input.isAnonymous) {
                await input.populate('author', 'majorName jobTitleName collegeName country user').execPopulate()
            } else {
                await input.populate('author', 'name imageURL majorName jobTitleName collegeName country user').execPopulate()
            }
            let commentObjects = []
            for (let comment of input.comments) {
                let commentObject = comment.toObject()
                commentObject.timeElapsed = moment(commentObject.dateCreated).fromNow()
                commentObject.author = await getAuthorFromUser(comment.author)
                commentObjects.push(commentObject)
            }
            let inputObject = input.toObject()
            inputObject.comments = commentObjects
            inputObject.timeElapsed = moment(inputObject.dateCreated).fromNow()
            inputObjects.push(inputObject)
        }
        articleObject.inputs = inputObjects
        res.status(200).json({
            article: articleObject
        })
    } catch (e) {
        logger.error(`GET | action=/articles/ | userId=${req.params.userId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.post('/:userId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let userId = req.params.userId
        let prompt = req.body.prompt
        let article = new articleSchema({
            prompt: prompt,
            author: userId
        })
        await article.save()
        logger.info(`POST | action=/ | userId=${userId} | message='User added new article'`)
        let alumnusAuthor = await alumniSchema.findOne({user: userId})
        alumnusAuthor.footyPoints += FOOTY_POINTS_CHART.alumnusAddedArticle
        alumnusAuthor.save()
        // create a global news item
        const newArticleNews = new newsSchema({
            event: 'New Article',
            alumni: [alumnusAuthor._id],
            supportData: {
                articleId: article._id,
                articlePrompt: prompt
            }
        })
        await newArticleNews.save();
        res.status(200).json({
            message: 'User added new article prompt'
        })
    } catch (e) {
        logger.error(`POST | action=/ | userId=${req.params.userId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.patch('/addInput/:userId/:articleId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        if (await userCanAddInput(req.params.userId)) {
            let userId = req.params.userId
            let articleId = req.params.articleId
            let article = await articleSchema.findById(articleId)
            if (!article) {
                logger.error(`PATCH | action=/addInput | userId=${req.params.userId} | message='Article not found with id='${articleId}'`)
                res.status(404).json({
                    message: `Article not found with id='${articleId}`
                })
                return
            }
            let input = req.body.input
            let isAnonymous = req.body.isAnonymous
            let alumnus = await alumniSchema.findOne({user: userId})
            let articleInput = new articleInputSchema({
                input: input,
                isAnonymous: isAnonymous,
                author: alumnus
            })
            await articleInput.save()
            article.inputs.push(articleInput)
            await article.save()
            alumnus.footyPoints += FOOTY_POINTS_CHART.alumnusAddedArticleInput
            alumnus.save()
            // create a global news item
            let newArticleNews 
            if (isAnonymous) {
                newArticleNews = new newsSchema({
                    event: 'New Article Input',
                    alumni: [],
                    supportData: {
                        articleId: articleId,
                        articlePrompt: article.prompt,
                        isAnonymous: true
                    }
                })
            } else {
                newArticleNews = new newsSchema({
                    event: 'New Article Input',
                    alumni: [alumnus._id],
                    supportData: {
                        articleId: articleId,
                        articlePrompt: article.prompt,
                        isAnonymous: false
                    }
                })
            }
            await newArticleNews.save();
            logger.info(`PATCH | action=/addInput | userId=${userId} | articleId=${articleId} | message='User added input to article'`)
            res.status(200).json({
                message: 'Successfully added input for article'
            })
        } else {
            logger.error(`PATCH | action=/addInput | userId=${req.params.userId} | message='User does not have required role to add an article input!'`)
            res.status(400).json({
                message: 'User does not have required role to add an article input!'
            })
        }
        
    } catch (e) {
        logger.error(`PATCH | action=/addInput | userId=${req.params.userId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

router.patch('/addComment/:userId/:articleInputId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let userId = req.params.userId
        let articleInputId = req.params.articleInputId
        let articleInput = await articleInputSchema.findById(articleInputId)
        if (!articleInput) {
            logger.error(`PATCH | action=/addComment | userId=${req.params.userId} | message='Article not found with id='${articleInputId}'`)
            res.status(404).json({
                message: `Article Input not found with id='${articleInputId}`
            })
            return
        }
        let commentText = req.body.comment
        let user = await userSchema.findById(userId)
        let comment = new articleCommentSchema({
            comment: commentText,
            author: user
        })
        await comment.save()
        articleInput.comments.push(comment)
        await articleInput.save()
        let profile = await alumniSchema.findOne({user: userId})
        if (profile) {
            profile.footyPoints += FOOTY_POINTS_CHART.alumnusAddedArticleComment
        } else {
            profile = await studentSchema.findOne({user: userId})
            profile.footyPoints += FOOTY_POINTS_CHART.studentAddedArticleComment
        }
        await profile.save()
        logger.info(`PATCH | action=/addComment | userId=${userId} | articleId=${articleInputId} | message='User added comment to article input'`)
        res.status(200).json({
            message: 'User added comment to article input'
        })
    } catch (e) {
        logger.error(`PATCH | action=/addComment | userId=${req.params.userId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

/**
 * Allows liking and unlike comment
 */
router.patch('/likeArticle/:userId/:articleInputId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    try {
        let userId = req.params.userId
        let articleInputId = req.params.articleInputId
        let articleInput = await articleInputSchema.findById(articleInputId)
        if (!articleInput) {
            logger.error(`PATCH | action=/likeArticle | userId=${req.params.userId} | message='Article input not found with id='${articleInputId}'`)
            res.status(404).json({
                message: `Article input not found with id='${articleInputId}`
            })
            return
        }
        if (articleInput.usersLiked.includes(userId)) {
            logger.info(`PATCH | action=/likeArticle | userId=${userId} | articleInputId=${articleInputId} | message='User unliked an input to article'`)
            articleInput.usersLiked = articleInput.usersLiked.filter(existingUserLike => existingUserLike.toString() !== userId)
        } else {
            logger.info(`PATCH | action=/likeArticle | userId=${userId} | articleInputId=${articleInputId} | message='User liked an input to article'`)
            articleInput.usersLiked.push(userId)
        }
        await articleInput.save()
        let likerProfile = await alumniSchema.findOne({user: userId})
        if (likerProfile) {
            likerProfile.footyPoints += FOOTY_POINTS_CHART.alumnusLikedInput
        } else {
            likerProfile = await studentSchema.findOne({user: userId})
            likerProfile.footyPoints += FOOTY_POINTS_CHART.studentLikedInput
        }
        await likerProfile.save()
        let likedProfile = await alumniSchema.findById(articleInput.author)
        likedProfile.footyPoints += FOOTY_POINTS_CHART.alumnusHasInputLiked
        await likedProfile.save()
        res.status(200).json({
            message: 'Successfully liked article input'
        })
    } catch (e) {
        logger.error(`PATCH | action=/likeArticle | userId=${req.params.userId} | error=${e}`)
        res.status(500).send({'error' : e});
    }
})

module.exports = router;