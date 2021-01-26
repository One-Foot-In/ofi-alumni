const express = require("express");
// const routes = require("./routes");
var alumniRouter = require('../routes/alumni');
var mongooseUtilRouter = require('../routes/utilMongoose');



function createServer() {
	const app = express();
    app.use(express.json());
    app.use('/alumni/', alumniRouter);
    app.use('/util/', mongooseUtilRouter);
	// app.use("/api", routes);
	return app;
}

module.exports = createServer;
