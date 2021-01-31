const mongoose = require("mongoose")
const createServer = require("./testingTools")
var alumniSchema = require('../models/alumniSchema');
const request = require('supertest');


const app = createServer();

/**
 * This runs before all tests in this particular file. I believe
 * this will needed to be included in every test file to get them
 * to work right.
 * I'd bet there's a way to get this to run once per test suite
 * instead of once per file, but I haven't looked into it yet.
 */
beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    mongoose.connect("mongodb://localhost:27017/test-test", { useNewUrlParser: true });
    await request(app).get('/util/seed/');
});


/**
 * Same thing as the beforeAll function, needs to be included on
 * all test files where you're hitting API endponts.
 * Just cleans up the tests after they've run.
 * 
 * The database might be better off getting reset after each test,
 * rather than after all have run, to help each test run independently
 * and be unaffected by surrounding tests (idempotent)
 */
afterAll(async () => {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany();
    }
    mongoose.connection.close();
});

test('8 footy points added for new opportunity post', async () => {
    user = await alumniSchema.findOne();
    // Need to extract the user ID for being able to make calls to the 
    // endpoints regarding the specific user (alumni, in this case)
    const userID = user._id;
    const res = await request(app).post(`/alumni/opportunity/${userID}`)
        .send({
            description: 'asdf',
            deadline: '10/12/2021',
            link: 'example.com'
        });
    expect(res.status).toEqual(200);
    // Before checking if the footy points updated, have to get the
    // updated user info by pulling from the db again
    refresh_user = await alumniSchema.findOne({_id: userID});
    expect(refresh_user.footyPoints).toEqual(8);
})
