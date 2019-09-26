const express = require('express');
const router = express.Router();
const PostService = require('../service/post');
const Auth = require('../utils/authorize');

// ADD NEW POST 
router.post('/add', Auth.userRole, 
  async function(req, res) {
    const result = await PostService.createPost(req); 
    res.json(result);
  }
);

router.post('/upload', Auth.userRole,
  async function(req, res) {    
    const result = await PostService.createMultiplePosts(req); 
    res.json(result);
  }
) 
// GET ALL POST
router.get('/', Auth.userRole,
  async function(req, res) {   
    const result = await PostService.getAllPosts(req);      
    res.json(result);
  }
);
 
// GET ONE POST
router.get('/(:id)', Auth.userRole,
  async function(req, res) {
    const result = await PostService.getPostById(req);    
    res.json(result);
  }
);

// GET ONE POST By Title
router.get('/title', Auth.userRole,
  async function(req, res) {        
    const result = await PostService.getPostByTitle(req);    
    res.json(result);
  }
);
// DELETE POST
router.delete('/delete/(:id)', Auth.userRole,
  async  function(req, res) {
    const post = await PostService.delete(req);    
    res.json(post);
  }
);

// UPDATE POST
router.put('/update/(:id)', Auth.userRole,
  async function(req, res) {    
    const result = await PostService.updatedPost(req);  
    res.json(result);
  }
);

module.exports = router;