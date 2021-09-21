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

/* Start add-new-category page. */
router.get('/', checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
      res.render('addNewCategory', { title: 'Password Management System', msg:'', loginUser : loginUser, pageTitle : 'Password Category Lists',errors:'',success:''  });
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
});
  
router.post('/',checkLoginUser, [ check('passwordCategory','Enter Password Category Name').isLength({ min: 1 })],function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.render('addNewCategory', { title: 'Password Management System',loginUser: loginUser, errors:errors.mapped(),success:'' });
    }else{
       var passCatName =req.body.passwordCategory;
       var passcatDetails =new passCatModel({
        password_category: passCatName
       });
  
       passcatDetails.save(function(err,doc){
         if(err) throw err;
         res.render('addNewCategory', { title: 'Password Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
       })
    }
});
  
  /* End add-new-category page. */

module.exports = router;
