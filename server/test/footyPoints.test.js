const express = require("express")
const mongoose = require("mongoose")
const createServer = require("./testingTools")
var alumniSchema = require('../models/alumniSchema');

// const { app } = require('../app');

// const createServer = require("./server") // new

// mongoose
// 	.connect("mongodb://localhost:27017/acmedb", { useNewUrlParser: true })
// 	.then(() => {
// 		const app = createServer() // new
// 		app.listen(5000, () => {
// 			console.log("Server has started!")
// 		})
// 	})


const request = require('supertest');

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    mongoose.connect("mongodb://localhost:27017/test-test", { useNewUrlParser: true });
    const seed = await request(app).get('/util/seed/');
    console.log(seed.status);
});

afterAll(async () => {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany();
    }
    mongoose.connection.close();
});

const app = createServer();

// test('test', async () => {
//     const res = await request(app).get('/alumni/one/1');
//     console.log(res.status);
//     console.log(res.body);
// });

test('better test', async () => {
    user = await alumniSchema.findOne()
    console.log(user)
    console.log(user._id);
    const res = await request(app).post(`/alumni/opportunity/${user._id}`).send({
        description: 'asdf',
        deadline: '10/12/2021',
        link: 'example.com'
    });
    expect(res.status).toEqual(200);
    refresh_user = await alumniSchema.findOne({_id: user._id});
    expect(refresh_user.footyPoints).toEqual(8);
})
