var express = require('express');
var passport = require("passport");
var router = express.Router();
var schoolSchema = require('../models/schoolSchema');
var collegeSchema = require('../models/collegeSchema');
var jobTitleSchema = require('../models/jobTitleSchema');
var companySchema = require('../models/companySchema');
var majorSchema = require('../models/majorSchema');
var interestsSchema = require('../models/interestsSchema');
var COUNTRIES = require("../countries").COUNTRIES
var actionItemSchema = require("../models/actionItemSchema");
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
      res.status(500).json({success:false, error: e})
    }
})

router.get('/jobTitles', async (req, res) => {
  try {
    let jobTitles = await jobTitleSchema.find()
    let jobTitlesOptions = jobTitles.map( job => {
      return {
        key: job.name,
        value: job._id,
        text: job.name,
      }
    })
    res.status(200).send({options: jobTitlesOptions})
  } catch (e) {
    console.log("Error index.js#jobTitlesOptions", e)
    res.status(500).json({success:false, error: e})
  }
})

router.get('/companies', async (req, res) => {
  try {
    let companies = await companySchema.find()
    let companiesOptions = companies.map( company => {
      return {
        key: company.name,
        value: company._id,
        text: company.name,
      }
    })
    res.status(200).send({options: companiesOptions})
  } catch (e) {
    console.log("Error index.js#companiesOptions", e)
    res.status(500).json({success:false, error: e})
  }
})

router.get('/majors', async (req, res) => {
  try {
    let majors = await majorSchema.find()
    let majorsOptions = majors.map( major => {
      return {
        key: major.name,
        value: major._id,
        text: major.name,
      }
    })
    res.status(200).send({options: majorsOptions})
  } catch (e) {
    console.log("Error index.js#majorsOptions", e)
    res.status(500).json({success:false, error: e})
  }
})

router.get('/interests', async (req, res) => {
  try {
    let interests = await interestsSchema.find()
    let interestsOptions = interests.map( interest => {
      return {
        key: interest.name,
        value: interest._id,
        text: interest.name,
      }
    })
    res.status(200).send({options: interestsOptions})
  } catch (e) {
    console.log("Error index.js#interestsOptions", e)
    res.status(500).json({success:false, error: e})
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
    res.status(500).json({success:false, error: e})
  }
})

router.get('/actionItems', async (req, res) => {
  try {
    let actionItems = await actionItemSchema.find()
    let actionitemsOptions = actionItems.map( actionitem => {
      return {
        key: actionitem.name,
        value: actionitem._id,
        text: actionitem.name,
      }
    })
    res.status(200).send({options: actionitemsOptions})
  } catch (e) {
    console.log("Error index.js#actionitemsOptions", e)
    res.status(500).json({success:false, error: e})
  }
})

module.exports = router;