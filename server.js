var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
const MongoClient = require('mongodb').MongoClient;
const BodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectID;
const mongoose  = require('mongoose');
const { createServer } = require( 'http');
const port = 3000;
//var Schema = mongoose.Schema;
//var hurley = require('./models/hurleys');

// Create a new Express application.
var app = express();

mongoose.connect ('mongodb+srv://Luke100:Luke100@clusterhurleyapp-ucfnz.mongodb.net/HurleyOrder?retryWrites=true&w=majority', {
  useNewUrlParser: true,
},
)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


/*
  const UserSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  });
  */

// const Hurley = mongoose.model('Hurley', UserSchema);
const Hurley = require('./models/Hurleys');

/*
  // Database example
  app.get('/',
    function(req, res) {
    Hurley.create({
        name: 'Denis',
        email:'test@email',
      })
      .then(user => res.send(user))
      .catch(err => res.send(err));

  //    Hurley.find()
    //  .then(user => res.send(user))
      //.catch(err => res.send(err));
    });*/

//  const server = createServer(app);
  //server.listen(port, () => console.log('Listening to port ${port}'));


/*
const uri = "mongodb+srv://Luke100:hurleyApplication@clusterhurleyapp-ucfnz.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});*/


// Configure the local strategy for use by Passport.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


// Configure view engine to render EJS templates.
app.use(express.static(__dirname + '/views'));
//app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

//HOME
// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

//Insert Press
app.post('/insert',   require('connect-ensure-login').ensureLoggedIn(),
function(req, res, next) {

 let name = req.user.username;
 let style = req.body.hurleystyleDROP;
 let size = req.body.hurleysizeDROP;
 let weight = req.body.hurleyweightDROP;
 let quantity = req.body.hurleyquantityDROP;

    console.log("Created Order for " + name + " " + style + " " + weight +  " " + quantity);
//    res.render('home');

      Hurley.create({
              name: name,
              hurleystyle: style,
              hurleysize: size,
              hurleyweight: weight,
              hurleyquantity: quantity,
            })
            .then(user => res.send(user))
            .catch(err => res.send(err));
            res.redirect('/');
    });

//OLD LOGIN PAGE
//app.get('/login',
  //function(req, res){
    //res.render('login');
//  });

//app.post('/login',
  //passport.authenticate('local', { failureRedirect: '/' }),
  //function(req, res) {
    //res.redirect('/');
//  });

//homepage LogIn
//BRING BACK AFTER DATABSE EXAMPLE



app.post('/home',
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });


app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });


app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
    Hurley.find()
    .then(user => res.send(user))
    .catch(err => res.send(err));
  });



/*
  app.get('/orders',
    require('connect-ensure-login').ensureLoggedIn(),
      function(req, res) {
         let name = req.user.username;

    Hurley.findOne( {name: name })
       .then(user => res.send(user))
       .catch(err => res.send(err));

    });

    app.get('/orders', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
          let name = req.user.username;
          Hurley.find(function(err, hurleys) {
             res.render('vieworders', { hurleys: hurleys});
          });
    });{name: 'jill'},
    */

app.get('/vieworders', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
          Hurley.find({name: req.user.username},function(err, hurleys) {
          res.render('vieworders', { user: req.user, hurleys: hurleys});
          console.log(hurleys);
      });
});


  //    let name = req.user.username;
  //    require('connect-ensure-login').ensureLoggedIn(),

    //  Hurley.find (function(err, res) {
        // res.render('vieworders', { user: req.user , hurleys: hurleys});
    //    res.render('vieworders', { hurleys: hurleys});
    //    console.log(hurleys);
    //  }
//  });

/*
    app.get("/orders",
    require('connect-ensure-login').ensureLoggedIn(),
      function(req, res) {

      let name = req.user.username;

    var myData = Hurley.findOne( {name: name })
    .then(item => {res.send(myData);
    })
    .catch(err => {
        res.status(400).send("Unable to get");
    });
});*/
/*
  app.get('/orders',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
      res.render('orders', { user: req.user });
    });*/

  app.get('/*',
    function(req, res){
      res.render('404');
    });

app.listen(3000);
//const server = createServer(app);
//server.listen(port, () => console.log('Listening to port ${port}'));
