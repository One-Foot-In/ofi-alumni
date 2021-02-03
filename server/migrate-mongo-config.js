// In this file you can configure migrate-mongo
require('dotenv').config();

const config = {
  mongodb: {
    
    url: (process.env.DBUSER && process.env.DBPASSWORD && process.env.DBHOST) ?  `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBHOST}` : "mongodb://localhost:27017",

    // TODO: Update this with prod db name
    databaseName: process.env.DB || "ofi-testdata",

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir 
  migrationFileExtension: ".js"
};

// Return the config as a promise
module.exports = config;
