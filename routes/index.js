var express = require('express');
var router = express.Router();
var bcrypt =require('bcryptjs');
var userModel = require('../modules/user');
var passCatModel = require('../modules/password_category'); 
var passModel = require('../modules/add_password'); 
var jwt = require('jsonwebtoken');


const { check, validationResult } = require('express-validator');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
//middlware to check User is login or not
function checkLoginUser(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

//middlware to check email
function checkemail(req, res, next){
  var email = req.body.email;
  var checkEmailExist = userModel.findOne({email: email});
  checkEmailExist.exec((err, data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup', { title: 'Password Management System', msg: 'Email Already Exist' });
    }
    next();
  })
}

/* GET login page. */
router.get('/', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(req.session.userName){
    res.redirect('./dashboard');
  }else{
    res.render('index', { title: 'Password Management System', msg:'' });
  }
});

router.post('/', function(req, res, next) {
  var username = req.body.uname;
  var password = req.body.password;
  var checkUser = userModel.findOne({username: username});
  checkUser.exec((err, data)=>{
    if(data == null){
      res.render('index', { title: 'Password Management System', msg:"Invalid Username and Password." });
    }else{
      if(err) throw err;
      var getUserID = data._id; 
      var getPassword = data.password; 
      if(bcrypt.compareSync(password,getPassword)){
        var token = jwt.sign({ userID: getUserID }, 'loginToken');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', username);
        req.session.userName = username;
        res.redirect('/dashboard');
      }else{
        res.render('index', { title: 'Password Management System', msg:"Invalid Username and Password." });
      }
    }
    next();
  })
});
/* End login page. */





//middlware to check username
function checkusername(req, res, next){
  var uname = req.body.uname;
  var checkNameExist = userModel.findOne({username: uname});
  checkNameExist.exec((err, data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup', { title: 'Password Management System', msg: 'Username Already Exist' });
    }
    next();
  })
}

/* GET signup page. */
router.get('/signup', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(req.session.userNamer){
    res.redirect('./dashboard');
  }else{
    res.render('signup', { title: 'Password Management System', msg: '' });
  }
});

router.post('/signup', checkemail, checkusername, function(req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;
  if(password !=confpassword){
    res.render('signup', { title: 'Password Management System', msg:'Password not matched!' });
  }else{
    password = bcrypt.hashSync(req.body.password, 10);
    var userDetails = new userModel({
      username : username,
      email : email,
      password : password
    })
    userDetails.save((err, doc)=>{
      if(err) throw err;
      res.render('signup', { title: 'Password Management System', msg: 'User registered Successfully' });
    })
  }
});
/* End signup page. */

//logout
router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});

module.exports = router;
