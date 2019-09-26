const Moment = require("moment");
const Crypto = require("crypto");
const AbstractModel = require('./abstract');
const connection = require('./database');
const cloudinary = require('cloudinary');
const CustomValidator = require('../utils/customValidator');
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;
const config = require('../config/env.json');

cloudinary.config({ 
  cloud_name: config.Cloudinary.cloud_name, 
  api_key: config.Cloudinary.api_key, 
  api_secret: config.Cloudinary.api_secret
});

class UserModel extends AbstractModel {
    constructor(params = {}) {
        super();
        this.id = params.id;
        this.name = params.name;
        this.email = params.email;
        this.password = params.password;
        this.profile = params.profile;
        this.type = params.type;
        this.phone = params.phone;
        this.address = params.address;
        this.dob = params.dob;
        this.created_at = params.created_at;
        this.updated_at = params.updated_at;
        this.deleted_at = params.deleted_at;
    }
    
    static async create(params) {  
        var validationErrors = this.validateCreateParams(params);
		if (validationErrors.length > 0) {
			throw new CustomError('Invalid input', 400, validationErrors);
        }
          
        const id =super.generateId();        
        var profile = null;
        if(params.profile) {
            var uploadImage = await cloudinary.uploader.upload(params.profile);
            profile = uploadImage.url;
        } 
        const user = {
            id: id,
            name: params.name,
            email: params.email,
            password: this.hashPassword(params.password),
            phone: params.phone,
            address: params.address !== undefined &&  params.address !== null ? params.address: null,
            profile: profile,
            type: params.type !== undefined ? params.type: this.type.user,
            dob:  params.dob !== undefined && params.dob !== null ? params.dob : null,
            created_at: Moment().format(),
            updated_at: Moment().format(),
            deleted_at: null
        };
        connection.query('INSERT INTO users SET ?', user);    
        return this.toModel(user);
    }

    static async update(params, userId) {
        var oldUserData = await this.getById(userId);
        var imageFilePath = oldUserData.profile;        
        var userProfile;
        if( params.profile != imageFilePath) {
            var uploadImage = await cloudinary.uploader.upload(params.profile, function(result) { return result.url; });            
            if( imageFilePath ) {
                var firstSplitVar = imageFilePath.split("/");
                var secondSplitVar = firstSplitVar[7].split(".");
                await cloudinary.uploader.destroy(secondSplitVar[0]);
            }
            userProfile = uploadImage.url;
        } else {
            userProfile = imageFilePath;
        }
        const user = {
            id: userId,
            name: params.name,
            email: params.email,
            password: this.hashPassword(params.password),
            phone: params.phone,
            address: params.address !== undefined &&  params.address !== null ? params.address: null,
            profile: userProfile,
            type: params.type !== undefined ? params.type: this.type.user,
            dob: params.dob !== undefined && params.dob !== null ? params.dob: null,
            created_at: Moment().format(),
            updated_at: Moment().format(),
            deleted_at: null
        };
        const query = "update users SET ? where id ='"+ userId +"'";
        
        connection.query(query, user);       
        return this.toModel(user);
    }

    static async getAllUser(searchData) {         
        var result = {};
        if(searchData && (searchData.name || searchData.email)) {
            result = await connection.query(`SELECT * FROM users WHERE name ='${searchData.name}' || email ='${searchData.email}'`);
        } else {
            result = await connection.query(`SELECT * FROM users`);
        }
        return result;
    }

    static async getById( id ) {
        const result = await connection.query(`SELECT * FROM users WHERE id = '${id}'`);
        
        return result[0];
    }

    static async getByLogin(params) {
        const validationErrors = this.validateLoginParams(params);
		if (validationErrors.length > 0) {
			throw new CustomError('Invalid input', 400, validationErrors);
		}
        const passwordHash = this.hashPassword(params.password);
        const query_str = `SELECT * FROM users WHERE email= '${params.email}' AND password= '${passwordHash}'`;
        const result = await connection.query(query_str);
        
        return result[0];
      }

    static async delete(id){
        const userId = { id: id };
        const deleteBook = await this.getById(id);
        const result = await connection.query('DELETE FROM users WHERE ?', userId);
        if(deleteBook.profile != "" && deleteBook.profile != null && deleteBook.profile != undefined ) {
            const profilePath = deleteBook.profile;
            const firstSplitVar = profilePath.split("/");
            const secondSplitVar = firstSplitVar[7].split(".");
            await cloudinary.uploader.destroy(secondSplitVar[0]);
        }
        
        return result;
    }

    static async getByEmail(email) {
        const result = await connection.query(`SELECT * FROM users WHERE email= '${email}'`);        

        return result;
    }

    static async getByName(userName) {
        const result = await connection.query(`SELECT * FROM users WHERE name= '${userName}'`);        

        return result;
    }

    static async change(params, id) {
        const hashPassword = this.hashPassword(params.newPassword);
        const query_str = `UPDATE users SET password = '${hashPassword}' WHERE id = '${id}'`;
        await connection.query(query_str);
    }

    static validateCreateParams(params) {
		if (!params) {
			return [{
				message: 'There is no input.'
			}];
		} else if (typeof params !== 'object') {
			return [{
				message: 'The parameter input format is incorrect'
			}];
		}

		const results = [
            CustomValidator.isRequired(params.name, 'name', 'Name'),
            CustomValidator.isRequired(params.email, 'email', 'Email'),
            CustomValidator.isRequired(params.password, 'password', 'Password'),
			CustomValidator.isRequired(params.phone, 'phone', 'Phone'),
			this.validateEmail(params.email),
			this.validatePassword(params.password),
		];
    
		const errors = results.filter(value => {
			return value !== null;
		});

		return errors;

	}

    static validateLoginParams(params) {
        if (!params) {
            return [{
                message: 'There is no input.'
            }];
        } else if (typeof params !== 'object') {
            return [{
                message: 'The parameter input format is incorrect'
            }];
        }

        const results = [
            CustomValidator.isRequired(params.email, 'email', 'email'),
            CustomValidator.isRequired(params.password, 'password', 'password'),
            this.validateEmail(params.email),
            this.validatePassword(params.password),
        ];

        const errors = results.filter(value => {
            return value !== null;
        });

        return errors;
    }
    
    static validatePasswordUpdateParams(params) {
        if (!params) {
            return [{
                message: 'There is no input.'
            }];
        } else if (typeof params !== 'object') {
            return [{
                message: 'The parameter input format is incorrect'
            }];
        }

        const results = [
            CustomValidator.isRequired(params.newPassword, 'newPassword', 'New Password'),
            this.validatePassword(params.newPassword),
        ];

        const errors = results.filter(value => {
            return value !== null;
        });

        return errors;

    }
    
    static hashPassword(password) {
        let passwordHash = process.env.SALT_KEY + password;
        for (var i = 0; i < 3; i++) {
        passwordHash = Crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");
        }
        return passwordHash;
    }

    static validateEmail(value, field = 'email', name = 'Email') {
        if (value === null || value === undefined) return null;
        
		let error = null;

		error = CustomValidator.isString(value, field, name);
		if (error) {
			return error;
		}

		error = CustomValidator.isEmail(value, field, name);
		if (error) {
			return error;
		}

		return null;
    }

	static validatePassword(value, field = 'password', name = 'Password') {
		if (value === null || value === undefined) return null;

		const config = {
			length: {
				min: 8,
				max: 20
			}
		};

		let error = null;

		error = CustomValidator.isString(value, field, name);
		if (error) {
			return error;
		}

		error = CustomValidator.isLength(value, field, name, config.length.min, config.length.max);
		if (error) {
			return error;
		}

		return null;
	}

    static toModel(item) {
        if (!item) return null;
        const params = {
            id: item.id !== undefined ? item.id : null,
            name: item.name !== undefined ? item.name : null,
            email: item.email !== undefined ? item.email : null,
            password: item.password !== undefined ? item.password : null,
            profile: item.profile !== undefined ? item.profile : null,
            type: item.type !== undefined ? item.type : null,
            phone: item.phone !== undefined ? item.phone : null,
            address: item.address !== undefined ? item.address : null,
            dob: item.dob !== undefined ? item.dob : null,
            created_at: item.created_at !== undefined ? item.created_at : null,
            updated_at: item.updated_at !== undefined ? item.updated_at : null,
            deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
        };
        return new UserModel(params);
    }
}

UserModel.type = {
    admin: 0,
    user: 1
};

module.exports = UserModel;