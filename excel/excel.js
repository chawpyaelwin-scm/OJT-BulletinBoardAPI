'use strict';

const moment = require('moment');
const Exceljs = require('exceljs');
const fs = require('fs');
const Model = require('../model');
const cloudinary = require('cloudinary');
const config = require('../config/env.json');

cloudinary.config({ 
    cloud_name: config.Cloudinary.cloud_name, 
    api_key: config.Cloudinary.api_key, 
    api_secret: config.Cloudinary.api_secret
  });

class Excel {
    static async generate(user) {           
        const workbook = new Exceljs.Workbook();
        await workbook.xlsx.readFile('excel/templates/post.xlsx');
        const sheetName = `Sheet1`;
        const sheet = workbook.getWorksheet(sheetName);        
        const posts = await Model.Post.getByUserId(user.created_user_id);
        let row = 2, number =1;
        for( let post of posts) {
            sheet.getCell('A' + row).value = number;
            sheet.getCell('B' + row).value = post.id;
            sheet.getCell('C' + row).value = post.title;
            sheet.getCell('D' + row).value = post.description;
            sheet.getCell('E' + row).value = post.status;
            sheet.getCell('F' + row).value = post.created_user_id;
            sheet.getCell('G' + row).value = post.updated_user_id;
            sheet.getCell('H' + row).value = post.deleted_user_id;
            sheet.getCell('I' + row).value = post.created_at;
            sheet.getCell('J' + row).value = post.updated_at;
            sheet.getCell('K' + row).value = post.deleted_at;
            row++;
            number++;
        }
        
        workbook.views = [
        {
            width: 20000,
            height: 12000,
            activeTab: 0
        }
    ];
    const base64 = await this.toBase64(workbook);
    
    const filename = `${moment().valueOf()}_post.xlsx`;
    return {
        data: base64,
        filename
    };
}

/**
 * Convert ExcelJS workbook to Base64 string.
 * @param {Object} workbook
 * @return {string}
 */
    static async toBase64(workbook) {
        const tmpFilename = `${moment().valueOf()}.xlsx`;
        const tmpFilepath = `./excel/templates/${tmpFilename}`;
        
        await workbook.xlsx.writeFile(tmpFilepath);

        const binary = fs.readFileSync(tmpFilepath);
        const base64 = Buffer.from(binary).toString('base64');
        
        return base64;
    }
}
module.exports = Excel;