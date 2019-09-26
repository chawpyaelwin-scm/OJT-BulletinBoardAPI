"use strict";

const Model = require("../model");
const AbstractService = require("./abstract");
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;
const csv = require('csv-parser');
const fs = require('fs');

class PostService extends AbstractService {
    static async createPost(params) {       
        try {
            const postCreateParams = {
                ...params.body
            };
            const tokenUser = await Model.Token.getByTokenString(params.headers.authorization);
            const post = await Model.Post.create(tokenUser, postCreateParams);  
        
            return super.success(null, {
                post: post
            });  
        } catch (error) {
            return super.failed(error, "An error occurred while creating post.");
        }
    }

    static async createMultiplePosts(params) {
        try {
            var dataString = params.body.upload;
            var base64Data = dataString.split(";base64,");            
            
            await fs.writeFile("sample.csv", base64Data[1], 'base64', (err) => {
                if (err) throw err;
                console.log('File saved!');
            });
            const tokenUser = await Model.Token.getByTokenString(params.headers.authorization);
            var results = [];
            fs.createReadStream('sample.csv')
            .pipe(csv())
            .on('data', (data) => 
             results.push(data))
            .on('end', () => {
                for(var row = 0; row<results.length; row++) {
                    var params = {};
                    params.title = results[row].Title;
                    params.description = results[row].Description;
                    params.status = results[row].Status;
                    Model.Post.create(tokenUser, params); 
                }
            });
        } catch (error) {
            return super.failed(error, "An error occurred while creating multiple posts.");
        }
    }

    static async getAllPosts(params) {
        try {
            const posts = await Model.Post.getAllPost(params.query);
    
            return super.success(null, {
                posts: posts
            });
        } catch (error) {
            return super.failed(error, "An error occoured in getting posts.");
        }
    }

    static async getPostById(data) {
        try {
            const post = await Model.Post.getById(data.params.id);

            if(!post) {
                throw new CustomError("Post not found!", 404);
            }
            
            return super.success(null, {
                post: post
            });
        } catch (error) {
            return super.failed(error, "An error occurred while retrieving the post by id.");
        }
    }

    static async getPostByTitle(data) {
        try {                        
            const tokenUser = await Model.Token.getByTokenString(data.headers.authorization);
            const post = await Model.Post.getByTitle(tokenUser, data.params.title);
            
            if(!post) {
                throw new CustomError("Post not found!", 404);
            }
            
            return super.success(null, {
                post: post
            });
        } catch (error) {
            return super.failed(error, "An error occurred while retrieving the post by id.");
        }
    } 

    static async updatedPost(postUpdateParam) {
        try {                      
          const tokenUser = await Model.Token.getByTokenString(postUpdateParam.headers.authorization);
          const post = await Model.Post.getById(postUpdateParam.params.id);
          
          if (!post) {
            throw new CustomError('Cannot get access to update for this post.', 409);
          }
          
          const updatedPost = await Model.Post.update(tokenUser, postUpdateParam.body, postUpdateParam.params.id);
  
          return super.success(null, {
            post : updatedPost
          }); 
        } catch (error) {
          return super.failed(error, "An error while updating the post.");
        }
    }

    static async delete(data) {
        try {
          const tokenUser = await Model.Token.getByTokenString(data.headers.authorization);
          const post = await Model.Post.getById(tokenUser, data.params.id);
  
          if(!post){
            return super.failed( null, { message:"Post not found!" } );
          }
          await Model.Post.delete(tokenUser, data.params.id);
    
          return super.success(null, {
            post: post
          });
        } catch (error) {
          return super.failed(error, "Error occoured while deleting the post.");
        }
    }
}

module.exports = PostService;
