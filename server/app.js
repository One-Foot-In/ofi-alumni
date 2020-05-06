var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var bcrypt = require('bcrypt');
const cors = require('cors');

// passport for authentication by local strategy
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var JWTStrategy = require("passport-jwt").Strategy;

var indexRouter = require('./routes/index');
var utilRouter = require('./routes/util');
var studentsRouter = require('./routes/students');
var staffRouter = require('./routes/staff');
var teachersRouter = require('./routes/teachers')
require('dotenv').config();

var app = express();
// perform actions on the collection object
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBHOST}/${process.env.DB}`;
const client = new MongoClient(uri);

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

async function main() {
  try {
    await client.connect();
    const db = client.db(process.env.DB);

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            const user = await db.collection('User').findOne({'email': email});
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

    app.use('/', (req, res, next) => {
      req.db = db;
      next();
    }, indexRouter);

    // test Router for testing health, database connection, and post
    app.use('/util/', (req, res, next) => {
      req.db = db;
      next();
    }, utilRouter);

    app.use('/students/', (req, res, next) => {
      req.db = db;
      next();
    }, studentsRouter);

    app.use('/staff/', (req, res, next) => {
      req.db = db;
      next();
    }, staffRouter);

    app.use('/teachers/', (req, res, next) => {
      req.db = db;
      next();
    }, teachersRouter);

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
