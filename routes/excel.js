const express = require('express');
const router = express.Router();
const ExcelService = require('../service/excel');
const Auth = require('../utils/authorize');

// DOWNLOAD POST
router.get('/download', Auth.userRole, 
    async function(req, res) {    
        const result = await ExcelService.download(req);  
        res.json(result);
        console.log(result);
        
    }
);

module.exports = router;
  