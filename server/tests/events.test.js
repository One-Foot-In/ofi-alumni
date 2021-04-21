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
    // remove seeded events
    await eventSchema.deleteMany()
    // create alumnus
    await request(app).post('/util/addAlumni/').send({
        email: "schoolalum@ofi.com",
        name: "school alum",
        accessContexts: [ "INTRASCHOOL" ],
        gradYear: Math.floor(Math.random()),
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
    var events = await eventSchema.find()
    var student = await studentSchema.findOne()
    var userID = student.user
    const res = await request(app).post(`/events/create/${userID}`)
        .send({
            title: 'how dinosaurs helped establish modern architecture'
        })
    expect(res.status).toEqual(403)
})

describe('alumni can successfully create new events', () => {
    afterAll(async () => {
        await eventSchema.deleteMany({ title: /^event test suite/ })
    })

    it("all parameters are successfully saved on the event", async () => {
        var alumnus = await alumniSchema.findOne()
        var user = await userSchema.findById(alumnus.user)
        var date = new Date()
        var eventRequestObj = {
            title: 'event test suite - staging the mars landing',
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
            title: 'event test suite - half-sour enthusiast networking network',
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
    afterAll(async () => {
        await eventSchema.deleteMany({ title: /^event test suite/ })
        // reset user permissions
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        await request(app).put(`/util/updateUser/${userRecord._id}`)
            .send({ accessContexts: [ "INTRASCHOOL" ] })
    })

    var eventRequestObj = {
        title: 'event test suite - the ambiguous lucid dream phenomenon',
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

describe('alumni can only get events within their access context', () => {
    beforeAll(async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var alumnus = await alumniSchema.findOne({ user: userRecord._id })
        var globalschool = await schoolSchema.findOne({ name: "Higgins Top" })
        var interschool = await schoolSchema.findOne({ name: "Higgins Bottom" })
        var localSchoolEventRequestObj = {
            title: 'event test suite - ghost hunting 101',
            date: new Date(),
            description: "An invisible man; Sleepin' in your bed",
            link: "ghostbusters4hire.com",
            creator: userRecord._id,
            school: alumnus.school
        }
        var intraSchoolEventRequestObj = {
            title: 'event test suite - ghost hunting 102',
            date: new Date(),
            description: "Ow, who you gonna call?",
            link: "ghostbusters4hire.com",
            creator: userRecord._id,
            school: interschool._id
        }
        var gloablSchoolEventRequestObj = {
            title: 'event test suite - ghost hunting 103',
            date: new Date(),
            description: "Ghostbusters!",
            link: "ghostbusters4hire.com",
            creator: userRecord._id,
            school: globalschool._id
        }
        await request(app).post('/util/addEvent/').send({ ...localSchoolEventRequestObj })
        await request(app).post('/util/addEvent/').send({ ...intraSchoolEventRequestObj })
        await request(app).post('/util/addEvent/').send({ ...gloablSchoolEventRequestObj })
    })

    afterAll(async () => {
        await eventSchema.deleteMany({ title: /^event test suite/ })
        // reset user permissions
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        await request(app).put(`/util/updateUser/${userRecord._id}`)
            .send({ accessContexts: [ "INTRASCHOOL" ] })
    })

    it("intraschool alumni user can only add events for users within their school", async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var alumnus = await alumniSchema.findOne({ user: userRecord._id })
        var res = await request(app).get(`/events/${userRecord._id}`)
        expect(res.status).toEqual(200)
        var resJson = JSON.parse(res.text)
        expect(resJson.events.length).toEqual(1)
    })


    it("interschool alumni user can only add events for within the school network", async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        // update user permissions
        await request(app).put(`/util/updateUser/${userRecord._id}`)
            .send({ accessContexts: [ "INTERSCHOOL" ] })
        var res = await request(app).get(`/events/${userRecord._id}`)
        expect(res.status).toEqual(200)
        var resJson = JSON.parse(res.text)
        expect(resJson.events.length).toEqual(2)
    })

    it("global alumni user can add event for any school", async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        // update user permissions
        await request(app).put(`/util/updateUser/${userRecord._id}`)
            .send({ accessContexts: [ "GLOBAL" ] })
        var res = await request(app).get(`/events/${userRecord._id}`)
        expect(res.status).toEqual(200)
        var resJson = JSON.parse(res.text)
        expect(resJson.events.length).toEqual(3)
    })
})

describe('start year filters alumni events based on graduation year', () => {
    beforeAll(async () => {
        var alumnus = await alumniSchema.findOne({ name: "school alum", city: "Osgiliath" })
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var gradYear = alumnus.gradYear
        // matching grad year
        var matchGradYearEventObj = {
            title: 'event test suite - epic movie',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            startYear: gradYear
        }
        // before grad year
        var beforeGradYearEventObj = {
            title: 'event test suite - scary movie',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            startYear: gradYear - 1
        }
        // after grad year
        var afterGradYearEventObj = {
            title: 'event test suite - disaster movie',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            startYear: gradYear + 1
        }
        await request(app).post('/util/addEvent/').send({ ...matchGradYearEventObj })
        await request(app).post('/util/addEvent/').send({ ...beforeGradYearEventObj })
        await request(app).post('/util/addEvent/').send({ ...afterGradYearEventObj })
    })

    afterAll(async () => {
        await eventSchema.deleteMany({ title: /^event test suite/ })
    })

    it('start year filters alumni events based on graduation year', async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var alumnus = await alumniSchema.findOne({ user: userRecord._id })
        var res = await request(app).get(`/events/${userRecord._id}`)
        expect(res.status).toEqual(200)
        var resJson = JSON.parse(res.text)
        expect(resJson.events.length).toEqual(2)
        expect(resJson.events[0].title).toEqual('event test suite - epic movie')
        expect(resJson.events[1].title).toEqual('event test suite - scary movie')
    })
})

describe('end year filters alumni events based on graduation year', () => {
    beforeAll(async () => {
        var alumnus = await alumniSchema.findOne({ name: "school alum", city: "Osgiliath" })
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var gradYear = alumnus.gradYear
        // matching grad year
        var matchGradYearEventObj = {
            title: 'event test suite - epic movie',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            endYear: gradYear
        }
        // before grad year
        var beforeGradYearEventObj = {
            title: 'event test suite - scary movie',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            endYear: gradYear - 1
        }
        // after grad year
        var afterGradYearEventObj = {
            title: 'event test suite - disaster movie',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            endYear: gradYear + 1
        }
        await request(app).post('/util/addEvent/').send({ ...matchGradYearEventObj })
        await request(app).post('/util/addEvent/').send({ ...beforeGradYearEventObj })
        await request(app).post('/util/addEvent/').send({ ...afterGradYearEventObj })
    })

    afterAll(async () => {
        await eventSchema.deleteMany({ title: /^event test suite/ })
    })

    test('end year filters alumni events based on graduation year', async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var alumnus = await alumniSchema.findOne({ user: userRecord._id })
        var res = await request(app).get(`/events/${userRecord._id}`)
        expect(res.status).toEqual(200)
        var resJson = JSON.parse(res.text)
        expect(resJson.events.length).toEqual(2)
        expect(resJson.events[0].title).toEqual('event test suite - epic movie')
        expect(resJson.events[1].title).toEqual('event test suite - disaster movie')
    })
})

describe('year ranges filter alumni events based on graduation year', () => {
    beforeAll(async () => {
        // create alumnus
        var alumnus = await alumniSchema.findOne({ name: "school alum", city: "Osgiliath" })
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var gradYear = alumnus.gradYear

        // date range contains grad year
        var containGradYearEventObj = {
            title: 'event test suite - sharknado',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            startYear: gradYear - 1,
            endYear: gradYear + 1
        }
        // date range before
        var beforeGradYearEventObj = {
            title: 'event test suite - meet the spartans',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            startYear: gradYear - 2,
            endYear: gradYear - 1
        }
        // date range after
        var afterGradYearEventObj = {
            title: 'event test suite - a haunted house',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            startYear: gradYear + 1,
            endYear: gradYear + 2
        }
        // matching grad year
        var matchGradYearEventObj = {
            title: 'event test suite - vampires suck',
            date: new Date(),
            description: "'nuff said",
            link: "spoofmoviesarelife.com",
            creator: userRecord._id,
            school: alumnus.school,
            startYear: gradYear,
            endYear: gradYear
        }
        await request(app).post('/util/addEvent/').send({ ...containGradYearEventObj })
        await request(app).post('/util/addEvent/').send({ ...beforeGradYearEventObj })
        await request(app).post('/util/addEvent/').send({ ...afterGradYearEventObj })
        await request(app).post('/util/addEvent/').send({ ...matchGradYearEventObj })
    })

    afterAll(async () => {
        await eventSchema.deleteMany({ title: /^event test suite/ })
    })

    test('year ranges filter alumni events based on graduation year', async () => {
        var userRecord = await userSchema.findOne({ email: 'schoolalum@ofi.com' })
        var alumnus = await alumniSchema.findOne({ user: userRecord._id })
        var res = await request(app).get(`/events/${userRecord._id}`)
        expect(res.status).toEqual(200)
        var resJson = JSON.parse(res.text)
        expect(resJson.events.length).toEqual(2)
        expect(resJson.events[0].title).toEqual('event test suite - sharknado')
        expect(resJson.events[1].title).toEqual('event test suite - vampires suck')
    })
})
