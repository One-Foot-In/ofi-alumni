const express = require("express");
var alumniRouter = require('../routes/alumni');
var mongooseUtilRouter = require('../routes/utilMongoose');


/*
 * Create the server for use in testing.
 * NOTE: For every new endpoint that you want to pull from,
 *       confirm that the router is included in this function
 *       or else it won't be able to find the route and you'll
 *       get confusing errors.
 */
function createServer() {
    const app = express();
    app.use(express.json());
    app.use('/alumni/', alumniRouter);
    app.use('/util/', mongooseUtilRouter);
	return app;
}

module.exports = createServer;
