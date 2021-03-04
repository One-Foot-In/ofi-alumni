const mongoose = require("mongoose")
const createServer = require("../testingTools")
const request = require('supertest');
var userSchema = require('../../models/userSchema');
var schoolSchema = require('../../models/schoolSchema');
var alumniSchema = require('../../models/alumniSchema');
var studentSchema = require('../../models/studentSchema');


const app = createServer();

const MOCK_S3_IMAGE = "some_image_link"

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

test('sign up student without referral', async () => {
    const dummyEmail = "dummy@student.com"
    const someRandomSchool = await schoolSchema.findOne()
    const res = await request(app).post(`/student/`).send({
        email: dummyEmail,
        grade: 11,
        imageURL: MOCK_S3_IMAGE,
        name: "Dummy",
        password: "pass",
        referrerId: "",
        schoolId: someRandomSchool._id,
        timeZone: 500
    });
    expect(res.status).toEqual(200);
    const user = await userSchema.findOne({email: dummyEmail});
    expect(!!user)
    expect(!user.approved)
})

test('sign up student via alumni referral', async () => {
    const dummyEmail = "dummy1@student.com"
    const someRandomSchool = await schoolSchema.findOne()
    const referringUser = await userSchema.findOne({role: {$in: ["ALUMNI"]}})
    const res = await request(app).post(`/student/`).send({
        email: dummyEmail,
        grade: 11,
        imageURL: MOCK_S3_IMAGE,
        name: "Dummy",
        password: "pass",
        referrerId: referringUser._id,
        schoolId: someRandomSchool._id,
        timeZone: 500
    });
    expect(res.status).toEqual(200);
    const user = await userSchema.findOne({email: dummyEmail});
    expect(!!user)
    expect(!user.approved)
    const referringAlumni = await alumniSchema.findOne({user: referringUser})
    expect(referringAlumni.footyPoints).toEqual(10);
})

test('sign up student via student referral', async () => {
    const dummyEmail = "dummy2@student.com"
    const someRandomSchool = await schoolSchema.findOne()
    const referringUser = await userSchema.findOne({role: {$in: ["STUDENT"]}})
    const res = await request(app).post(`/student/`).send({
        email: dummyEmail,
        grade: 11,
        imageURL: MOCK_S3_IMAGE,
        name: "Dummy",
        password: "pass",
        referrerId: referringUser._id,
        schoolId: someRandomSchool._id,
        timeZone: 500
    });
    expect(res.status).toEqual(200);
    const user = await userSchema.findOne({email: dummyEmail});
    expect(!!user)
    expect(!user.approved)
    const referringStudent = await studentSchema.findOne({user: referringUser})
    expect(referringStudent.footyPoints).toEqual(10);
})