const express = require("express")
const mongoose = require("mongoose")
const createServer = require("./testingTools")
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

beforeAll(() => {
    process.env.NODE_ENV = 'test';
    mongoose.connect("mongodb://localhost:27017/test-test", { useNewUrlParser: true });
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

test('test', async () => {
    const seed = await request(app).get('/util/seed/');
    console.log(seed.status);
    const res = await request(app).get('/alumni/one/1');
    console.log(res.status);
    console.log(res.body);
});
