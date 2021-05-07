const { ObjectId } = require('bson');
const { ObjectID } = require('bson');
const User = require('./models/user')
// import { db } from "../app/models/user"
module.exports = function (app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs', {
      user: req.user
    })
  });
  app.get('/home', function (req, res) {
    res.render('home.ejs', {
      user: req.user,
    })
  });
  // app.get('/login', function(req, res) {
  //   res.render('login.ejs');        // });
  // app.get('/signup', function(req, res) {
  //   res.render('signUp.ejs');
  // });

  // PROFILE SECTION =========================
  app.get('/main', isLoggedIn, function (req, res) {
    let isAdmin
    if(req.user.local.isAdmin){
      isAdmin = true
    }else{
      isAdmin = false
    }
    // db.collection('admin').find().toArray((err, result) => {
    //   if (err) return console.log(err)
      res.render('main.ejs', {
        user: req.user,
        isAdmin: isAdmin
        // pages: result.pages
      })
    // })
  });
  //help page
  app.get('/help', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('help.ejs', {
        user: req.user,
        messages: result
      })
    })
  });
  app.get('/shelter', isLoggedIn, function (req, res) {
    db.collection('shelter').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('shelter.ejs', {
        user: req.user,
        messages: result
      })
    })
  });
  app.get('/food', isLoggedIn, function (req, res) {
    db.collection('food').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('food.ejs', {
        user: req.user,
        messages: result
      })
    })
  });
  app.get('/fun', isLoggedIn, function (req, res) {
    db.collection('fun').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('fun.ejs', {
        user: req.user,
        messages: result
      })
    })
  });
  app.get('/resources', isLoggedIn, function (req, res) {
    db.collection('resources').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('resources.ejs', {
        user: req.user,
        messages: result
      })
    })
  });
  app.get('/needs', isLoggedIn, function (req, res) {
    db.collection('needs').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('needs.ejs', {
        user: req.user,
        messages: result
      })
    })
  });
  // messages page
  app.get('/messages', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('messages.ejs', {
        user: req.user,
        messages: result
      })
    })
  });
  app.put('/thumbUp', isLoggedIn, function (req, res) {
    db.collection('messages').findOneAndUpdate({_id:ObjectId(req.body.id)}, {$set: {thumbUp: req.body.thumbUp+1}},{}, (err,result)=>{ 
      if (err) return console.log(err)
      res.redirect('/messages')
    });
  });
  app.put('/thumbDown', isLoggedIn, function (req, res) {
    db.collection('messages').findOneAndUpdate({_id: ObjectId(req.body.id)}, {$set:{thumbDown: req.body.thumbDown+1}},{}, (err,result)=>{
      if (err) return console.log(err)
      res.redirect('/messages')
    });
  });
  app.get('/need', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('needs.ejs', {
        user: req.user,
        messages: result
      })
    })
  });

  app.get('/admin', isLoggedIn, function (req, res) {
    if (req.user.local.isAdmin){
      res.render('admin.ejs', {
        user: req.user,
        pages: req.user.admin
      })
    }else{
      res.redirect('/login')
    }
  });

  app.post('/newSite', isLoggedIn, function (req, res) {
      let category = req.body.cat
      db.collection(category).insertOne({name:req.body.name, link:req.body.link}, (err, result)=>{
        if (err) return console.log(err)
        res.redirect('/admin')
      });
    });


  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/messages', (req, res) => {
    db.collection('messages').save({
      name: req.body.name,
      msg: req.body.msg,
      thumbUp: 0,
      thumbDown: 0
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('messages')
    })
  })

  app.put('/thumpUp', (req, res) => {
    db.collection('messages')
      .findOneAndUpdate({
        name: req.body.name,
        msg: req.body.msg
      }, {
        $set: {
          thumbUp: req.body.thumbUp + 1
        }
      }, {
        sort: {
          _id: -1
        },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })
  app.put('/thumpDown', (req, res) => {
    db.collection('messages')
      .findOneAndUpdate({
        name: req.body.name,
        msg: req.body.msg
      }, {
        $set: {
          thumbDown: req.body.thumbDown + 1
        }
      }, {
        sort: {
          _id: -1
        },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.delete('/messages', (req, res) => {
    db.collection('messages').findOneAndDelete({
      name: req.body.name,
      msg: req.body.msg
    }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/main', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signUp', function (req, res) {
    res.render('signUp.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signUp', passport.authenticate('local-signup', {
    successRedirect: '/main', // redirect to the secure profile section
    failureRedirect: '/signUp', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}