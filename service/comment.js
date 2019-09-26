"use strict";

const Model = require("../model");
const AbstractService = require("./abstract");
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;

class CommentService extends AbstractService {
    static async createComment(params) {       
        try {
            const commentCreateParams = {
                ...params.body
            };            
            const tokenUser = await Model.Token.getByTokenString(params.headers.authorization);
            const comment = await Model.Comment.create(tokenUser, commentCreateParams);  
        
            return super.success(null, {
                comment: comment
            });  
        } catch (error) {
            return super.failed(error, "An error occurred while creating comment.");
        }
    }

    static async updateComment(commentUpdateParam) {
        try {                      
          const tokenUser = await Model.Token.getByTokenString(commentUpdateParam.headers.authorization);
          const comment = await Model.Comment.getById(commentUpdateParam.params.id);
          
          if (!comment) {
            throw new CustomError('Cannot get access to update for this comment.', 409);
          }
          
          const updatedComment = await Model.Comment.update(tokenUser, commentUpdateParam.body, commentUpdateParam.params.id);
  
          return super.success(null, {
            comment : updatedComment
          }); 
        } catch (error) {
          return super.failed(error, "An error while updating the comment.");
        }
    }

    static async getAllComments(params) {
        try {
            const comments = await Model.Comment.getAllComment(params.query);
    
            return super.success(null, {
                comments: comments
            });
        } catch (error) {
            return super.failed(error, "An error occoured in getting comments.");
        }
    }

    static async getCommentById(data) {
        try {
            const comment = await Model.Comment.getById(data.params.id);

            if(!comment) {
                throw new CustomError("Comment not found!", 404);
            }
            
            return super.success(null, {
                comment: comment
            });
        } catch (error) {
            return super.failed(error, "An error occurred while retrieving the comment by id.");
        }
    }

    static async getCommentByPostId(data) {
        try {            
            const comment = await Model.Comment.getByPostId(data.params.postId);

            if(!comment) {
                throw new CustomError("Comment not found!", 404);
            }
            
            return super.success(null, {
                comment: comment
            });
        } catch (error) {
            return super.failed(error, "An error occurred while retrieving the comment by id.");
        }
    }

    static async delete(data) {
        try {
          const tokenUser = await Model.Token.getByTokenString(data.headers.authorization);
          const comment = await Model.Comment.getById(data.params.id);
            
          if(!comment){
            return super.failed( null, { message:"Comment not found!" } );
          }
          await Model.Comment.delete(tokenUser, data.params.id);
    
          return super.success(null, {
            comment: comment
          });
        } catch (error) {
          return super.failed(error, "Error occoured while deleting the comment.");
        }
    }
}

module.exports = CommentService;
