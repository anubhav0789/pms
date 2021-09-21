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

/* Start password Category list page. */
router.get('/',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
        var getPassCat = passCatModel.find({}); //get password category list
        getPassCat.exec((err, data)=>{
          if(err) throw err;
          res.render('password_category', { title: 'Password Management System', msg:'', loginUser : loginUser, pageTitle : 'Password Category Lists',errors:'',success:'', records: data });
        })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
});
  
  
router.get('/delete/:id',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
        var passcat_id = req.params.id;
        var getPassCat = passCatModel.find({});
        var passDelete = passCatModel.findByIdAndDelete(passcat_id); //delete password category
        passDelete.exec((err)=>{
          if(err) throw err;
          res.redirect('/passwordCategory')
        })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
});
  
router.get('/edit/:id',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
        var passcat_id = req.params.id;
        var getPassCat = passCatModel.find({});
        var getPassCategory = passCatModel.findById(passcat_id); //delete password category
        getPassCategory.exec((err, data)=>{
          if(err) throw err;
          res.render('edit_pass_category', { title: 'Password Management System', msg:'', loginUser : loginUser, pageTitle : 'Password Category Lists',errors:'',success:'', records: data });
        })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
});
  
router.post('/edit/',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
        var passcat_id = req.body.id;
        var passwordCategory = req.body.passwordCategory;
        var updatePassCat = passCatModel.findByIdAndUpdate(passcat_id, {password_category:passwordCategory}); //delete password category
        updatePassCat.exec((err, data)=>{
          if(err) throw err;
          res.redirect('/passwordCategory');
        })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
});
  /* End password Category list page. */



module.exports = router;
