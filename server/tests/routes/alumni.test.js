const mongoose = require("mongoose")
const createServer = require("../testingTools")
const request = require('supertest');
var userSchema = require('../../models/userSchema');
var schoolSchema = require('../../models/schoolSchema');
var alumniSchema = require('../../models/alumniSchema');
var studentSchema = require('../../models/studentSchema');
const majorSchema = require("../../models/majorSchema");
const collegeSchema = require("../../models/collegeSchema");


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

test('sign up alumnus without referral', async () => {
    const dummyEmail = "dummy@alumni.com"
    const someRandomSchool = await schoolSchema.findOne()
    const someRandomMajor = await majorSchema.findOne()
    const someRandomCollege = await collegeSchema.findOne()
    const res = await request(app).post(`/alumni/`).send({
        city: "Best City",
        collegeCountry: "Antigua and Barbuda",
        country: "Albania",
        email: dummyEmail,
        existingCollegeId: someRandomCollege._id,
        existingCompanyId: "",
        existingInterests: [],
        existingJobTitleId: "",
        existingMajorId: someRandomMajor._id,
        graduationYear: "2014",
        imageURL: MOCK_S3_IMAGE,
        name: "Dummy Alum",
        newCollege: "",
        newCompany: "",
        newInterests: [],
        newJobTitle: "",
        newMajor: "",
        password: "pass",
        referrerId: "",
        schoolId: someRandomSchool._id,
        timeZone: 500,
        topics: [],
        zoomLink: ""
    });
    expect(res.status).toEqual(200);
    const user = await userSchema.findOne({email: dummyEmail});
    expect(!!user)
    expect(!user.approved)
})

test('sign up alumnus via alumni referral', async () => {
    const dummyEmail = "dummy1@alumni.com"
    const someRandomSchool = await schoolSchema.findOne()
    const someRandomMajor = await majorSchema.findOne()
    const someRandomCollege = await collegeSchema.findOne()
    const referringUser = await userSchema.findOne({role: {$in: ["ALUMNI"]}})
    const res = await request(app).post(`/alumni/`).send({
        city: "Best City",
        collegeCountry: "Antigua and Barbuda",
        country: "Albania",
        email: dummyEmail,
        existingCollegeId: someRandomCollege._id,
        existingCompanyId: "",
        existingInterests: [],
        existingJobTitleId: "",
        existingMajorId: someRandomMajor._id,
        graduationYear: "2014",
        imageURL: MOCK_S3_IMAGE,
        name: "Dummy Alum",
        newCollege: "",
        newCompany: "",
        newInterests: [],
        newJobTitle: "",
        newMajor: "",
        password: "pass",
        referrerId: referringUser._id,
        schoolId: someRandomSchool._id,
        timeZone: 500,
        topics: [],
        zoomLink: ""
    });
    expect(res.status).toEqual(200);
    const user = await userSchema.findOne({email: dummyEmail});
    expect(!!user)
    expect(!user.approved)
    const referringAlumni = await alumniSchema.findOne({user: referringUser})
    expect(referringAlumni.footyPoints).toEqual(10);
})

test('sign up alumnus via student referral', async () => {
    const dummyEmail = "dummy2@alumni.com"
    const someRandomSchool = await schoolSchema.findOne()
    const someRandomMajor = await majorSchema.findOne()
    const someRandomCollege = await collegeSchema.findOne()
    const referringUser = await userSchema.findOne({role: {$in: ["STUDENT"]}})
    const res = await request(app).post(`/alumni/`).send({
        city: "Best City",
        collegeCountry: "Antigua and Barbuda",
        country: "Albania",
        email: dummyEmail,
        existingCollegeId: someRandomCollege._id,
        existingCompanyId: "",
        existingInterests: [],
        existingJobTitleId: "",
        existingMajorId: someRandomMajor._id,
        graduationYear: "2014",
        imageURL: MOCK_S3_IMAGE,
        name: "Dummy Alum",
        newCollege: "",
        newCompany: "",
        newInterests: [],
        newJobTitle: "",
        newMajor: "",
        password: "pass",
        referrerId: referringUser._id,
        schoolId: someRandomSchool._id,
        timeZone: 500,
        topics: [],
        zoomLink: ""
    });
    expect(res.status).toEqual(200);
    const user = await userSchema.findOne({email: dummyEmail});
    expect(!!user)
    expect(!user.approved)
    const referringStudent = await studentSchema.findOne({user: referringUser})
    expect(referringStudent.footyPoints).toEqual(10);
})