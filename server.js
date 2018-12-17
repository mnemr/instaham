/* Instaham - get the meat on your popularity 
 Requirements 
 - Accept User Name and find user / require user to login to view their data
 - Display users photos 
 - Loop through photos and return likes in chronological order 
 - Return likes in chronological order used for graph
 - Find user's likes that have influenced their popularity ( ex: T.I. liked my photo, now I have 200 more followers)
 - Long term - image processing to map elements of photo and their influence to popularity
*/

/*
  - As a user I want to login using my instagram credentials
  - As a user I want to view photos on a timeline with number of likes
  - As a user I want to view number of followers of users that like selected photo
  - As a user I want to view a snapshot of followers when large changes occur 
*/

/* endpoints 

*/


// Client ID: ea1e7ad0424948818eb18a7dcfbddd94
// Client Secret: a24512ee5d744ab88b3ee2c185a32ab3

/* Resources
    https://github.com/jaredhanson/passport-instagram/blob/master/examples/login/app.js
    http://expressjs.com/en/4x/api.html
*/

var express = require('express');
var logger = require('express-logger');
var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;
var util = require('util');
var app = express();
var request = require('request');

var INSTGRAM_CLIENT_ID = "ea1e7ad0424948818eb18a7dcfbddd94";
var INSTGRAM_CLIENT_SECRET = "a24512ee5d744ab88b3ee2c185a32ab3";
var INSTGRAM_AC_TOKEN = null;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Instagram profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function(obj, done){
    done(null, obj);
});

// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.
passport.use(new InstagramStrategy({
    clientID: INSTGRAM_CLIENT_ID,
    clientSecret: INSTGRAM_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    INSTGRAM_AC_TOKEN = accessToken;  
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Instagram profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Instagram account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// configure Express
app.use(logger({path: "./logs/logfile.txt"}));
//app.use(express.bodyParser());
// app.use(express.methodOverride());
// app.use(express.session({ secret: 'keyboard cat' }));
// // Initialize Passport!  Also use passport.session() middleware, to support
// // persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
// app.use(app.router);
//app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/instagram
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Instagram authentication will involve
//   redirecting the user to instagram.com.  After authorization, Instagram
//   will redirect the user back to this application at /auth/instagram/callback
app.get('/auth/instagram',
  passport.authenticate('instagram'),
  function(req, res){
    // The request will be redirected to Instagram for authentication, so this
    // function will not be called.
  });

// GET /auth/instagram/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('yo');    
    res.redirect('/getself');
  });


app.get('/getself', 
  function(req,res){
    request('https://api.instagram.com/v1/users/self/media/recent/?access_token='+INSTGRAM_AC_TOKEN, function (error, response, body) {
    console.log('body:', body.data); // Print the HTML for the Google homepage.
    res.send(body);
    });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});




app.listen(3001);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

