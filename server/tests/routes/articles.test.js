const mongoose = require("mongoose")
const createServer = require("../testingTools")
var alumniSchema = require('../../models/alumniSchema');
var articleSchema = require('../../models/articles/articleSchema');
var articleInputSchema = require('../../models/articles/articleInputSchema');
var articleCommentSchema = require('../../models/articles/articleCommentSchema');
const userSchema = require("../../models/userSchema");
const { notifyNewArticleInput } = require('../../routes/article')
const request = require('supertest');


const app = createServer();

beforeAll(async (done) => {
    process.env.NODE_ENV = 'test';
    mongoose.connect("mongodb://localhost:27017/test-test", { useNewUrlParser: true });
    await request(app).get('/util/seed/');
    done()
});

afterAll(async () => {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany();
    }
    await mongoose.connection.close();
    delete process.env.NODE_ENV
});

const setupArticleWithInputsAndComments = async () => {
     // create an article
    let allAlumni = await alumniSchema.find({})
    let allStudentUsers = await userSchema.find({role: {$in: ["STUDENT"]}})
    let comment1 = new articleCommentSchema({
        author: allStudentUsers[0],
        comment: 'comment1'
    })
    // create 8 comments by 5 students
    await comment1.save()
    let comment2 = new articleCommentSchema({
        author: allStudentUsers[0],
        comment: 'comment2'
    })
    await comment2.save()
    let comment3 = new articleCommentSchema({
        author: allStudentUsers[1],
        comment: 'comment3'
    })
    await comment3.save()
    let comment4 = new articleCommentSchema({
        author: allStudentUsers[2],
        comment: 'comment4'
    })
    await comment4.save()
    let comment5 = new articleCommentSchema({
        author: allStudentUsers[3],
        comment: 'comment5'
    })
    await comment5.save()
    let comment6 = new articleCommentSchema({
        author: allStudentUsers[4],
        comment: 'comment6'
    })
    await comment6.save()
    let comment7 = new articleCommentSchema({
        author: allStudentUsers[4],
        comment: 'comment7'
    })
    await comment7.save()
    let comment8 = new articleCommentSchema({
        author: allStudentUsers[4],
        comment: 'comment8'
    })
    await comment8.save()
    // create 4 comments by 2 alumni
    let comment9 = new articleCommentSchema({
        author: allAlumni[1].user,
        comment: 'comment9'
    })
    await comment9.save()
    let comment10 = new articleCommentSchema({
        author: allAlumni[1].user,
        comment: 'comment10'
    })
    await comment10.save()
    let comment11 = new articleCommentSchema({
        author: allAlumni[2].user,
        comment: 'comment11'
    })
    await comment11.save()
    let comment12 = new articleCommentSchema({
        author: allAlumni[2].user,
        comment: 'comment12'
    })
    await comment12.save()
    // create 4 article inputs
    let inputer1 = allAlumni[1]
    let inputer2 = allAlumni[2]
    let inputer3 = allAlumni[3]
    let inputer4 = allAlumni[4]
    let articleInput1 = new articleInputSchema({
        author: inputer1,
        input: 'input1',
        isAnonymous: false,
        comments: [comment1, comment2, comment9]
    })
    await articleInput1.save()
    let articleInput2 = new articleInputSchema({
        author: inputer2,
        input: 'input2',
        isAnonymous: false,
        comments: [comment3, comment4, comment5]
    })
    await articleInput2.save()
    let articleInput3 = new articleInputSchema({
        author: inputer3,
        input: 'input3',
        isAnonymous: true,
        comments: [comment5, comment6, comment7, comment8, comment9]
    })
    await articleInput3.save()
    let articleInput4 = new articleInputSchema({
        author: inputer4,
        input: 'input4',
        isAnonymous: false,
        comments: [comment8, comment9, comment10, comment11, comment12]
    })
    await articleInput4.save()
    let article = new articleSchema({
        prompt: 'This is the prompt',
        author: allAlumni[0].user,
        inputs: [articleInput1, articleInput2, articleInput3, articleInput4]
    })
    await article.save()
    return {
        article: article,
        articleAuthor: allAlumni[0],
        inputs: [articleInput1, articleInput2, articleInput3, articleInput4],
        inputAuthors: [inputer1, inputer2, inputer3, inputer4],
        comments: [comment1, comment2, comment3, comment4, comment5, comment6, comment7, comment8, comment9, comment10, comment11, comment12]
    }
}

test('email alerts on new article input', async () => {
    let articleSetup = await setupArticleWithInputsAndComments()
    await notifyNewArticleInput(articleSetup.article, 'alumni1@ofi.com', articleSetup.inputAuthors[0].name, articleSetup.article.prompt)
    // check console.logs for emails sent to alumni and students
})