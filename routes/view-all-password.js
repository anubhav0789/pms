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
    if(req.session.userName){
      var decoded = jwt.verify(userToken, 'loginToken');
    }else{
      res.redirect('/');
    }
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

/* Without pugin pagination starts
router.get('/view-all-password', checkLoginUser, function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){

    var perPage = 3;
    var page = 1;

    var getAllPass = passModel.find({});
    getAllPass.skip((perPage * page) - perPage)
    .limit(perPage).exec((err, data)=>{
      if(err) throw err;
      passModel.countDocuments({}).exec((err,count)=>{ 
        res.render('view-all-password', 
                    { title: 'Password Management System', 
                      msg:'', loginUser : loginUser, 
                      pageTitle : 'Password Category Lists', 
                      errors:'', success:'Password Details inserted successfully', 
                      records: data,
                      current: page,
                      pages: Math.ceil(count / perPage)  
                    });
      })
    })
  }else{
    res.render('index', { title: 'Password Management System', msg:'' });
  }
});

router.get('/view-all-password/:page', checkLoginUser, function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){

    var perPage = 3;
    var page = req.params.page;

    var getAllPass = passModel.find({});
    getAllPass.skip((perPage * page) - perPage)
    .limit(perPage).exec((err, data)=>{
      if(err) throw err;
      passModel.countDocuments({}).exec((err,count)=>{ 
        res.render('view-all-password', 
                    { title: 'Password Management System', 
                      msg:'', loginUser : loginUser, 
                      pageTitle : 'Password Category Lists', 
                      errors:'', success:'Password Details inserted successfully', 
                      records: data,
                      current: page,
                      pages: Math.ceil(count / perPage)  
                    });
      })
    })
  }else{
    res.render('index', { title: 'Password Management System', msg:'' });
  }
});
 Without pugin pagination Ends*/
 
router.get('/', checkLoginUser, function(req, res, next) {
    var loginUser=req.session.userName;
    if(loginUser){
  
      var options = {
          offset:   1, 
          limit:    3
      };
  
      passModel.paginate({}, options).then(function(result) {
          //console.log(result);
          res.render('view-all-password', 
                      { title: 'Password Management System', 
                        msg:'', loginUser : loginUser, 
                        pageTitle : 'Password Category Lists', 
                        errors:'', success:'Password Details inserted successfully', 
                        records: result.docs,
                        current: result.offset,
                        pages: Math.ceil(result.total / result.limit)  
                      });
  
      })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
});
  
router.get('/:page', checkLoginUser, function(req, res, next) {
    var loginUser=req.session.userName;
    if(loginUser){
  
      var perPage = 3;
      var page = req.params.page;
  
      var getAllPass = passModel.find({});
      getAllPass.skip((perPage * page) - perPage)
      .limit(perPage).exec((err, data)=>{
        if(err) throw err;
        passModel.countDocuments({}).exec((err,count)=>{ 
          res.render('view-all-password', 
                      { title: 'Password Management System', 
                        msg:'', loginUser : loginUser, 
                        pageTitle : 'Password Category Lists', 
                        errors:'', success:'Password Details inserted successfully', 
                        records: data,
                        current: page,
                        pages: Math.ceil(count / perPage)  
                      });
        })
      })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
});

module.exports = router;
