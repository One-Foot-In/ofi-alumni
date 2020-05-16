var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
const cors = require('cors');

// passport for authentication by local strategy
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var JWTStrategy = require("passport-jwt").Strategy;

var indexRouter = require('./routes/index');
var utilRouter = require('./routes/util');
require('dotenv').config();

var app = express();
// perform actions on the collection object
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/* 
 * If testDB is true, uses a locally hosted mongoDB
 * Otherwise, it will use a cloud hosted DB set in the .env file
 * MongoDB must be installed
 */
const testDB = true

const mongoose = require('mongoose');
const uri = testDB ? 'mongodb://localhost:27017/ofi-test' : `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBHOST}/${process.env.DB}`;
mongoose.connect(uri, {useNewUrlParser: true});

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {type: String, reguired: true},
    passwordHash: {type: String, required: true},
    verificationToken: {type: String, required: true},
    role: {type: String, required: true},
    emailVerified: {type: Boolean, required: true},
    approved: {type: Boolean, required: true}
  }
);

module.exports = mongoose.model('User', userSchema)

const client = mongoose.connection;
client.on('error', console.error.bind(console, 'connection error:'));
client.once('open', function() {
  console.log('successful mongoose connection')
});


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
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            var user = mongoose.model('User', userSchema);
            user.findOne({'email': email}, 'passwordHash');
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
      req.db = client;
      next();
    }, indexRouter);

    // test Router for testing health, database connection, and post
    app.use('/util/', (req, res, next) => {
      req.db = client;
      next();
    }, utilRouter);

    app.use('/students/', (req, res, next) => {
      req.db = client;
      next();
    }, studentsRouter);

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
