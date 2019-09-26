const Moment = require("moment");
const Crypto = require("crypto");
const connection = require('./database');
const AbstractModel = require('./abstract');
const UserModel = require('./user');
const CustomValidator = require('../utils/customValidator');
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;

class PostModel extends AbstractModel {
    constructor(params = {}) {
        super();
        this.id = params.id;
        this.title = params.title;
        this.description = params.description;
        this.status = params.status;
        this.created_user_id = params.created_user_id;
        this.updated_user_id = params.updated_user_id;
        this.deleted_user_id = params.deleted_user_id;
        this.created_at = params.created_at;
        this.updated_at = params.updated_at;
        this.deleted_at = params.deleted_at;
    }
    
    static create(currentUser, params) {    
        const validationErrors = this.validateCreateParams(params);
        if (validationErrors.length > 0) {
            return new CustomError('Invalid input', 400, validationErrors);
        }

        const id =super.generateId();        
        const postCreateParams = {
            id : id,
            title: params.title,
            description: params.description,
            status: params.status !== undefined ? params.status: this.status.active,
            created_user_id : currentUser.created_user_id,
            updated_user_id : currentUser.created_user_id,
            deleted_user_id: null,
            created_at: Moment().format(),
            updated_at: Moment().format(),
            deleted_at: null
          };
        connection.query('INSERT INTO posts SET ?', postCreateParams);    
        return postCreateParams;
    }

    static async createPost(params) {
        const validationErrors = this.validateCreateParams(params);
            if (validationErrors.length > 0) {
                throw new CustomError('Invalid input', 400, validationErrors);
            }
        const item = await this.create(params);
    
        return item;
    }

    static update(currentUser, params, postId) {
        const postUpdateParams = {
            title: params.title,
            description: params.description,
            status: params.status !== undefined ? params.status: this.status.active,
            created_user_id : currentUser.created_user_id,
            updated_user_id : currentUser.created_user_id,
            deleted_user_id: null,
            created_at: Moment().format(),
            updated_at: Moment().format(),
            deleted_at: null
          };
        
        const query = `update posts SET ? where id ='${postId}' `;
        
        connection.query(query, postUpdateParams);       
        return postUpdateParams;
    }

    static async getAllPost(searchData) {
        var result = {}; 
        var creater = null;        
        if(searchData) {
            if(!searchData.createdUser && searchData.title) {
                result = await connection.query(`SELECT * FROM posts WHERE title ='${searchData.title}'`);
            } else if (!searchData.title && searchData.createdUser) {
                creater = await UserModel.getByName(searchData.createdUser);
                for(var index in creater) {
                    result = await connection.query(`SELECT * FROM posts WHERE created_user_id ='${creater[index].id}'`)
                }
            } else if(searchData.title && searchData.createdUser) {
                creater = await UserModel.getByName(searchData.createdUser);
                for(var index in creater) {
                    result = await connection.query(`SELECT * FROM posts WHERE created_user_id ='${creater[index].id}' AND title ='${searchData.title}'`)
                }
            } else {
                result = await connection.query(`SELECT * FROM posts`);
            }
        }
        
        return result;
    }

    static async getById(id) {        
        const result = await connection.query(`SELECT * FROM posts WHERE id = '${id}'`);
        
        return result[0];
    }

    static async getByUserId(userId) {                
        var result = await connection.query(`SELECT * FROM posts WHERE created_user_id = '${userId}'`);

        return result;
    }

    static async delete(currentUser, id){        
        const result = await connection.query(`DELETE from posts WHERE id = '${id}' AND created_user_id = '${currentUser.created_user_id}'`);
        
        return result;
    }

    static async getByTitle(currentUser, postTitle) {        
        const result = await connection.query(`SELECT * FROM posts WHERE title = '${postTitle}' AND created_user_id = '${currentUser.created_user_id}' `);

        return result;
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
            CustomValidator.isRequired(params.title, 'title', 'Title'),
            CustomValidator.isRequired(params.description, 'description', 'Description'),
		];
    
		const errors = results.filter(value => {
			return value !== null;
		});

		return errors;
    }
  
	static validateTitle(value, field = 'password', name = 'Password') {

		if (value === null || value === undefined) return null;

		const config = {
			length: {
				min: 1,
				max: 255
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
          title: item.title !== undefined ? item.title : null,
          description: item.description !== undefined ? item.description : null,
          status: item.status !== undefined ? item.status : null,
          created_user_id: item.created_user_id !== undefined ? item.created_user_id : null,
          updated_user_id: item.updated_user_id !== undefined ? item.updated_user_id : null,
          deleted_user_id: item.deleted_user_id !== undefined ? item.deleted_user_id : null,
          created_at: item.created_at !== undefined ? item.created_at : null,
          updated_at: item.updated_at !== undefined ? item.updated_at : null,
          deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
        };
        
        return new PostModel(params);
    }
}

PostModel.status = {
    inactive: "0",
    active: "1"
};

module.exports = PostModel;