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

/* Start add-new-password page. */
router.get('/', checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
        var getPassCat = passCatModel.find({});
        getPassCat.exec((err, data)=>{
          if(err) throw err;
          res.render('add-new-password', { title: 'Password Management System', msg:'', loginUser : loginUser, pageTitle : 'Password Category Lists', records: data, success:'',errors:''  });
        })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
  });
  
router.post('/', checkLoginUser,[ check('project_name','Enter Project Name').isLength({ min: 1 })], function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        var getPassCat = passCatModel.find({});
        getPassCat.exec((err, data)=>{
          if(err) throw err;
          res.render('add-new-password', { title: 'Password Management System',loginUser: loginUser, errors:errors.mapped(), success:'', records: data });
        })
      
    }else{
       var passCat =req.body.pass_cat;
       var projectName =req.body.project_name;
       var passDetails =req.body.pass_details;
       var passwordDetails =new passModel({
        password_category: passCat,
        project_name: projectName,
        password_detail: passDetails
       });
  
       passwordDetails.save(function(err,doc){
         if(err) throw err;
         var getPassCat = passCatModel.find({});
         getPassCat.exec((err, data)=>{
           if(err) throw err;
           res.render('add-new-password', { title: 'Password Management System', msg:'', loginUser : loginUser, errors:'', success:'Password Details inserted successfully', records: data });
         })
       })
    }
});

module.exports = router;
