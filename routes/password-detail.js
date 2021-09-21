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

//edit
router.get('/', checkLoginUser, function(req, res, next) {
    res.redirect('/dashboard');
  });
  
  router.get('/edit/:id', checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    var id=req.params.id;
    if(loginUser){
      var id=req.params.id;
      var getPassDetail = passModel.findById({_id: id});
      getPassDetail.exec((err, data)=>{
        var getPassCat = passCatModel.find({});
        getPassCat.exec((err, data1)=>{
          if(err) throw err;
          res.render('edit_password_detail', { title: 'Password Management System', msg:'', loginUser : loginUser, pageTitle : 'Password Category Lists', errors:'', success:'', record: data, records: data1 });
        })
      })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
  });
  
  router.post('/edit/:id', checkLoginUser,[ check('project_name','Enter Project Name').isLength({ min: 1 })], function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    
    if(loginUser){
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        var id=req.params.id;
        var getPassDetail = passModel.findById({_id: id});
        getPassDetail.exec((err, data)=>{
          var getPassCat = passCatModel.find({});
          getPassCat.exec((err, data1)=>{
            if(err) throw err;
            res.render('edit_password_detail', { title: 'Password Management System', msg:'', loginUser : loginUser, pageTitle : 'Password Category Lists', errors:errors.mapped(), success:'', record: data, records: data1 });
          })
        })
  
      }else{
        var id=req.body.id;
        var passCat=req.body.pass_cat;
        var projectName =req.body.project_name;
        var passDetails =req.body.pass_details;
        
        var updatePassDetails = passModel.findByIdAndUpdate(id, {password_category: passCat, project_name: projectName, password_detail: passDetails}); 
        updatePassDetails.exec((err, data)=>{
            if(err) throw err;
            var getPassDetail = passModel.findById({_id: id});
            getPassDetail.exec((err, data1)=>{
              var getPassCat = passCatModel.find({});
              getPassCat.exec((err, data2)=>{
                if(err) throw err;
                res.render('edit_password_detail', { title: 'Password Management System', msg:'', loginUser : loginUser, errors:'', success:'Password Details updated successfully', records: data2, record: data1 });
              })
            })
        })
      }
      
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
  });
  
  
  
  router.get('/delete/:id',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
        var pass_id = req.params.id;
        //var passModel = passModel.find({});
        var passDelete = passModel.findByIdAndDelete(pass_id); //delete password 
        passDelete.exec((err)=>{
          if(err) throw err;
          res.redirect('/view-all-password')
        })
    }else{
      res.render('index', { title: 'Password Management System', msg:'' });
    }
  });
  /* End password-detail page. */

module.exports = router;
