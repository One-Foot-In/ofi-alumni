const mongoose = require("mongoose")
const createServer = require("./testingTools")
var alumniSchema = require('../models/alumniSchema')
var userSchema = require('../models/userSchema')
var studentSchema = require('../models/studentSchema')
var schoolSchema = require('../models/schoolSchema')
var majorSchema = require('../models/majorSchema')
var eventSchema = require('../models/eventSchema')
const request = require('supertest')
var COUNTRIES = require("../countries").COUNTRIES

const app = createServer()

beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    mongoose.connect("mongodb://localhost:27017/test-test", { useNewUrlParser: true })
    await request(app).get('/util/seed/')
})

afterAll(async () => {
    // await request(app).get('/data/clear/all')
    const collections = Object.keys(mongoose.connection.collections)
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName]
        await collection.deleteMany()
    }
    await mongoose.connection.close()
    delete process.env.NODE_ENV
})

test('students not allowed to create new events', async () => {
    var student = await studentSchema.findOne()
    var userID = student.user
    const res = await request(app).post(`/events/create/${userID}`)
        .send({
            eventName: 'how dinosaurs helped establish modern architecture'
        })
    expect(res.status).toEqual(403)
})

describe('alumni can successfully create new events', () => {

    it("all parameters are successfully saved on the event", async () => {
        var alumnus = await alumniSchema.findOne()
        var user = await userSchema.findById(alumnus.user)
        var date = new Date()
        var eventRequestObj = {
            name: 'staging the mars landing',
            years: [ 2012, 2013, 2014 ],
            link: 'linkthelink.com',
            school: alumnus.school,
            description: "they staged the moon. we do mars. looking for innovators, artists, people who want a hand in making history!",
            date
        }
        var res = await request(app).post(`/events/create/${alumnus.user}`).send(eventRequestObj)
        var resJson = JSON.parse(res.text)
        var createdEvent = await eventSchema.findById(resJson.event._id)
        expect(createdEvent.creator).toEqual(alumnus.user)
        expect(createdEvent.name).toEqual(eventRequestObj.name)
        expect(createdEvent.date).toEqual(eventRequestObj.date)
        expect(createdEvent.description).toEqual(eventRequestObj.description)
        expect(createdEvent.link).toEqual(eventRequestObj.link)
        expect(createdEvent.school).toEqual(eventRequestObj.school)
        expect(JSON.stringify(createdEvent.years)).toEqual(JSON.stringify(eventRequestObj.years))
        expect(res.status).toEqual(200)
    })

    it('if no school provided use alumni school as default', async () => {
        var alumnus = await alumniSchema.findOne()
        var user = await userSchema.findById(alumnus.user)
        var date = new Date()
        var eventRequestObj = {
            name: 'half-sour enthusiast networking network',
            years: [ 2012, 2013, 2014 ],
            link: 'linkthesink.com',
            description: 'hoping to create a space for fellow half-sour pickle enthusiasts. full-sour speculators welcome.',
            date
        }
        var res = await request(app).post(`/events/create/${alumnus.user}`).send(eventRequestObj)
        expect(res.status).toEqual(200)
        var resJson = JSON.parse(res.text)
        var createdEvent = await eventSchema.findById(resJson.event._id)
        expect(createdEvent.school).toEqual(alumnus.school)
    })
})

describe('alumni can only create events within their access context', () => {

    beforeAll(async () => {
        // create alumnus
        await request(app).post('/util/addAlumni/').send({
            email: "schoolalum@ofi.com",
            name: "school alum",
            accessContexts: [ "INTRASCHOOL" ],
            gradYear: Math.random(),
            country: "Germany",
            city: "Osgiliath"
        })
        var alumnus = await alumniSchema.findOne({ name: "school alum", city: "Osgiliath" })
        var alumnusSchool = await schoolSchema.findById(alumnus.school)
        // create inter-network school
        await request(app).post('/util/addSchool/').send({
            name: "Higgins Bottom",
            country: alumnusSchool.country
        })
        // create global school
        await request(app).post('/util/addSchool/').send({
            name: "Higgins Top",
            country: COUNTRIES.find(country => country !== alumnusSchool.country)
        })
    })

    var eventRequestObj = {
        name: 'the ambiguous lucid dream phenomenon',
        date: new Date(),
        description: "'nuff said",
        link: "linkonthebrink.com"
    }

    it("intraschool alumni user can only add events for users within their school", async () => {
        // test intra-school success case
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var alumnus = await alumniSchema.findOne({ user: userRecord })
        var res = await request(app).post(`/events/create/${userRecord._id}`)
            .send({ ...eventRequestObj, school: alumnus.school})
        expect(res.status).toEqual(200)
        // test inter-school failure case
        var interschool = await schoolSchema.findOne({ name: "Higgins Bottom" })
        res = await request(app).post(`/events/create/${userRecord._id}`)
            .send({ ...eventRequestObj, school: interschool._id})
        expect(res.status).toEqual(403)
    })

    it("interschool alumni user can only add events for within the school network", async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        // update user permissions
        await request(app).put(`/util/updateUser/${userRecord._id}`)
            .send({ accessContexts: [ "INTERSCHOOL" ] })
        // test inter-school success case
        var interschool = await schoolSchema.findOne({ name: "Higgins Bottom" })
        var res = await request(app).post(`/events/create/${userRecord._id}`)
            .send({ ...eventRequestObj, school: interschool._id})
        expect(res.status).toEqual(200)
        // test global school failure case
        var globalschool = await schoolSchema.findOne({ name: "Higgins Top" })
        res = await request(app).post(`/events/create/${userRecord._id}`)
            .send({ ...eventRequestObj, school: globalschool._id})
        expect(res.status).toEqual(403)
    })

    it("global alumni user can add event for any school", async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        // update user permissions
        await request(app).put(`/util/updateUser/${userRecord._id}`)
            .send({ accessContexts: [ "GLOBAL" ] })
        // test global school success case
        var globalschool = await schoolSchema.findOne({ name: "Higgins Top" })
        var res = await request(app).post(`/events/create/${userRecord._id}`)
            .send({ ...eventRequestObj, school: globalschool._id})
        expect(res.status).toEqual(200)
    })
})
