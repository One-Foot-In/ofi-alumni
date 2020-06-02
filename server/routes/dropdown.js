var express = require('express');
var router = express.Router();
var schoolSchema = require('../models/schoolSchema');
var collegeSchema = require('../models/collegeSchema');
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

router.get('/schoolsOptions', async (req, res) => {
    try {
      let schools = await schoolSchema.find()
      let schoolOptions = schools.map( school => {
        return {
          key: school.name,
          value: school._id,
          text: `${school.name} (${school.country})`,
        }
      })
      res.status(200).send({options: schoolOptions})
    } catch (e) {
      console.log("Error index.js#schoolsOptions")
      res.status(500).json({Success:false, error: e})
    }
})

router.get('/colleges/:country', async (req, res) => {
  try {
    let country = req.params.country
    let colleges = await collegeSchema.find({country: country})
    let collegeOptions = colleges.map( college => {
      return {
        key: college.name,
        value: college._id,
        text: `${college.name} (${college.country})`,
      }
    })
    res.status(200).send({options: collegeOptions})
  } catch (e) {
    console.error("Error dropdown.js#collegeOptions", e)
    res.status(500).json({Success:false, error: e})
  }
})

module.exports = router;