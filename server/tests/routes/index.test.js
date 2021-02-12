const mongoose = require("mongoose")
const createServer = require("../testingTools")
var alumniSchema = require('../../models/alumniSchema');
var studentSchema = require('../../models/studentSchema');
var schoolSchema = require('../../models/schoolSchema');
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

test('get counts for schools, alumni, and students', async () => {
    const res = await request(app).get(`/totalCounts`)
    schoolsCount = await schoolSchema.count();
    alumniCount = await alumniSchema.count();
    studentsCount = await studentSchema.count();
    expect(res.status).toEqual(200);
    expect(res.body.schoolsCount).toEqual(schoolsCount);
    expect(res.body.alumniCount).toEqual(alumniCount);
    expect(res.body.studentsCount).toEqual(studentsCount);
})

test('get sampleSignUps for alumni', async () => {
    const res = await request(app).get(`/sampleSignUps`)
    let alumni = await alumniSchema.find();
    expect(res.status).toEqual(200);
    let alumniNamesInResponse = res.body.sampleSignUps.map(alumnus => alumnus.name)
    let approvedAlumniNamesInDb = alumni.filter(alumnus => alumnus.approved).map(alumnus => alumnus.name)
    let allAlumniAreApproved = true
    for (let name of alumniNamesInResponse) {
        allAlumniAreApproved = approvedAlumniNamesInDb.includes(name)
    }
    expect(res.body.sampleSignUps.length).toEqual(5);
    expect(allAlumniAreApproved).toEqual(true);
})