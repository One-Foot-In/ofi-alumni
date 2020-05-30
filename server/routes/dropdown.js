var express = require('express');
var router = express.Router();
var schoolSchema = require('../models/schoolSchema');
var COUNTRIES = require("../countries").COUNTRIES
require('mongoose').Promise = global.Promise

router.get('/countries/', async (req, res, next) => {
    try {
        const options = COUNTRIES.map(country => {
            return {
                key: country,
                value: country,
                text: country
            }
        })
        res.status(200).send({options: options})
    } catch (e) {
        res.status(500).send({
            message: 'Failed fetching countries: ' + e
        });
    }
});

router.get('/schoolsOptions/:country', async (req, res) => {
    try {
      let schools = await schoolSchema.find({country: req.params.country})
      let schoolOptions = schools.map( school => {
        return {
          key: school.name,
          value: school.name,
          text: school.name
        }
      })
      res.status(200).send({options: schoolOptions})
    } catch (e) {
      console.log("Error index.js#schoolsOptions")
      res.status(500).json({Success:false, error: e})
    }
})

module.exports = router;