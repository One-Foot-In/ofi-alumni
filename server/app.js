var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
const cors = require('cors');
var CronJob = require('cron').CronJob;
var { sendWeeklyEmailDigest } = require('./routes/helpers/emailHelpers');
// passport for authentication by local strategy
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var JWTStrategy = require("passport-jwt").Strategy;

var indexRouter = require('./routes/index');
var alumniRouter = require('./routes/alumni');
var studentsRouter = require('./routes/students');
var adminRouter = require('./routes/admin');
var ambassadorRouter = require('./routes/country_ambassador');
var collegeRepRouter = require('./routes/collegeRep');
var userRouter = require('./routes/user');
var dropdownRouter = require('./routes/dropdown');
var utilRouter = require('./routes/util');
var mongooseUtilRouter = require('./routes/utilMongoose');
var requestRouter = require('./routes/requests');
var newsRouter = require('./routes/newsfeed');
var imageRouter = require('./routes/image');
var conversationsRouter = require('./routes/conversations')

require('dotenv').config();

var app = express();
// perform actions on the collection object
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'build')));

/* 
 * If testDB is true, uses a locally hosted mongoDB
 * Otherwise, it will use a cloud hosted DB set in the .env file
 * MongoDB must be installed
 */
const testDB = (process.env.DEV_MODE && process.env.DEV_MODE.toLowerCase() === "true");

/*
  Mongoose Setup
  w=majority specifies that all database replicas acknowledge that the write is completed
  retryWrites=true retries writing to database if the first attempt fails
 */
const mongoose = require('mongoose');
const uri = testDB ? 'mongodb://localhost:27017/ofi-testdata' : `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBHOST}/${process.env.DB}?retryWrites=true&w=majority`;

/* Mongoose Models */
const userSchema = require('./models/userSchema')

const JWT_SECRET = process.env.JWT_SECRET || 'secret_sauce';

let corsRegexString = process.env.CORS_REGEX || 'localhost';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsRegexString)
  next();
})

let corsRegex = new RegExp(`.*${corsRegexString}.*`);

let corsOptions = {
  origin: corsRegex,
  credentials: true,
}
app.use(cors(corsOptions));

// CRON EXPRESSIONS
/*
  Seconds: 0-59
  Minutes: 0-59
  Hours: 0-23
  Day of Month: 1-31
  Months: 0-11 (Jan-Dec)
  Day of Week: 0-6 (Sun-Sat)
*/
const emailDigestCron = process.env.EMAIL_DIGEST_CRON || '0 0 12 * * 6' // Sunday noon

async function main() {
  try {
    await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

    const client = mongoose.connection;
    await client.on('error', console.error.bind(console, 'connection error:'));
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            var user = await userSchema.findOne({'email': email});
            if (!user) {
                return done('User not found');
            }
            const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
            if (passwordsMatch) {
                return done(null, user);
            } else {
                return done('Incorrect Password!');
            }
        } catch (error) {
            done(error);
        }
    }));
    // JWT strategy to check jwt token from cookies
    passport.use(new JWTStrategy({
        jwtFromRequest: req => req.cookies.jwt,
        // must be protected secret
        secretOrKey: JWT_SECRET,
      },
      (jwtPayload, done) => {
        if (Date.now() > jwtPayload.expires) {
          return done('jwt expired');
        }
        return done(null, jwtPayload);
      }
    ));

    var emailDigestJob = new CronJob(emailDigestCron, async () => {
    // do not wait on sending email
    sendWeeklyEmailDigest();
    }, null, true, 'America/New_York');

    if (process.env.ACTIVATE_CRON) {
      emailDigestJob.start()
    }

    app.use('/', indexRouter);

    // test Router for testing health, database connection, and post
    app.use('/util-deprecated/', utilRouter);

    // TODO: comment out util-router wire-up in production instance
    app.use('/util/', mongooseUtilRouter);

    app.use('/request/', requestRouter);
    
    app.use('/alumni/', alumniRouter);

    app.use('/student/', studentsRouter);

    app.use('/admin/', adminRouter);

    app.use('/ambassador/', ambassadorRouter);

    app.use('/collegeRep/', collegeRepRouter);

    app.use('/user/', userRouter);

    app.use('/drop/', dropdownRouter);

    app.use('/news/', newsRouter);

    app.use('/image/', imageRouter);

    app.use('/conversations/', conversationsRouter);

    // app will cause the frontend to be served
    // for any end-point path that it cannot resolve
    app.get('*', (req, res) => {
       res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
    })

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.json({error : err});
    });
  } catch (e) {
    console.error(e);
  }
}

main().catch(console.err);

module.exports = app;
