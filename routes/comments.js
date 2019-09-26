const express = require('express');
const router = express.Router();
const CommentService = require('../service/comment');
const Auth = require('../utils/authorize');

// ADD NEW COMMENT 
router.post('/add', Auth.userRole, 
  async function(req, res) {
    const result = await CommentService.createComment(req); 
    res.json(result);
  }
);

// UPDATE COMMENT
router.put('/update/(:id)', Auth.userRole,
  async function(req, res) {    
    const result = await CommentService.updateComment(req);  
    res.json(result);
  }
);

// DELETE COMMENT
router.delete('/delete/(:id)', Auth.userRole,
  async  function(req, res) {
    const result = await CommentService.delete(req);    
    res.json(result);
  }
);

// GET ALL COMMENT
router.get('/', Auth.userRole,
  async function(req, res) {   
    const result = await CommentService.getAllComments(req);      
    res.json(result);
  }
);
 
// GET ONE COMMENT
router.get('/(:id)', Auth.userRole,
  async function(req, res) {
    const result = await CommentService.getCommentById(req);    
    res.json(result);
  }
);

// GET COMMENT BY POST
router.get('/postId/(:postId)', Auth.userRole,
  async function(req, res) {    
    const result = await CommentService.getCommentByPostId(req);    
    res.json(result);
  }
);

module.exports = router;