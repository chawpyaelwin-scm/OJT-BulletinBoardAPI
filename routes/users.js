const express = require('express');
const router = express.Router();
const UserService = require('../service/user');
const Auth = require('../utils/authorize');

// ADD NEW USER POST ACTIO
router.post('/add', Auth.userRole, 
  async function(req, res) {    
    var result = await UserService.createUser(req); 
    res.json(result);
  }
);

// GET ALL USER
router.get('/', Auth.userRole,  
  async function(req, res) {   
    var result = await UserService.getAllUsers(req); 
    res.json(result);
  }
);

// GET ONE USER
router.get('/(:id)', Auth.userRole, 
  async function(req, res) {
    var result = await UserService.getByUserId(req);    
    res.json(result);
  }
);

// GET LOGIN USER 
router.post('/login',
  async function(req, res) {
    var result = await UserService.login(req.body); 
    res.json(result);
  }
);

// LOGOUT USER
router.post('/logout', Auth.userRole, 
  async function(req, res) {  
    var result = await UserService.logout(req);
    res.json(result);
  }
);

// DELETE USER
router.delete('/delete/(:id)', Auth.adminRole, 
  async function(req, res) {
    var result = await UserService.delete(req.params.id);    
    res.json(result);
  }
);

// UPDATE USER PUT
router.put('/update/(:id)', Auth.userRole, 
  async function(req, res) {
    var result = await UserService.updateUser(req);  
    res.json(result);
  }
);

// CHANGE PASSWORD
router.put('/password', Auth.userRole, 
  async function(req, res) {    
    var result = await UserService.changePassword(req);  
    res.json(result);
  }
);

module.exports = router;
