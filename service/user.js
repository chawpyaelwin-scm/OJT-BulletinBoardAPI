"use strict";

const Model = require("../model");
const AbstractService = require("./abstract");
const Util = require("../utils/util");
const Email = require("../utils/email");
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;

class UserService extends AbstractService {

  async authenticate(params) {
    try {
      const accessToken = Util.getAccessToken(params);
      if (!accessToken) {
        throw new CustomError("Please Login with token.", 403);
      }
      const token = await Model.Token.getByTokenString(accessToken);
      if (token === null || token === undefined || !token) {
        throw new CustomError(
          "An access token that does not exist is being sent.",
          403
        );
      }

      const user = await Model.User.getByEmail(token.email);
      if (!user || user === null || user === undefined) {
        throw new CustomError("User not found。", 404);
      }

      return user;
    } catch (error) {
      super.throwCustomError(error, "Authencation failed.");
    }
  }

  async adminRole(params) {    
    const user = await this.authenticate(params);
    if (user.type != 0) {
      throw new CustomError("Can not get access admin role.", 409);
    }

    return user;
  }

  static async createUser(params) {                
    try {
      const userCreateParams = {
        ...params.body
      };
      
      const oldUser = await Model.User.getByEmail(userCreateParams.email);
      
      if (Object.keys(oldUser).length !== 0) {
        throw new CustomError("This email is already registered.", 409);
      }
      var user = await Model.User.create(userCreateParams);  
      await Email.send(user.email);
  
      return super.success(null, {
        user: user
      });
    } catch (error) {
      return super.failed(error, "An error occoured during user create procress.");
    }
  }

  static async getAllUsers(params) {
      try {        
        const users = await Model.User.getAllUser(params.query);
        return super.success(null, {
          users: users
        });
      } catch (error) {
        return super.failed(error, "An error occoured during getting users.");
      }
  }

  static async getByUserId(data) {        
      try {
          const user = await Model.User.getById(data.params.id);
          
          return super.success(null, {
                  user: user
                });
      } catch (error){
          return super.failed(error, "An error occurred while retrieving the user by id.");
      }
  }

  static async login(params) {
      try {          
          const user = await Model.User.getByLogin(params);  
          if (user == undefined) {
              return super.failed(409,"Email or password is wrong.");
          }
          const tokenString = Util.randomString(64);
          await Model.Token.save(user.email, user.id, tokenString);
          return super.success(null, {
                user: user,
                token: tokenString
              });
      } catch (error) {
        return super.failed(error, "An error occoured during login process.");
      }
  }

  static async logout(params) {        
      try {            
        const tokenString = Util.getAccessToken(params);
        
        await Model.Token.delete(tokenString);
  
        return super.success(200, {
          message: "Logout Success."
        });
      } catch (error) {
        return super.failed(error);
      }
  }

  static async updateUser(userUpdateParams) {
      try {
          const tokenUser = await Model.Token.getByTokenString(userUpdateParams.headers.authorization);
          const currentUser = await Model.User.getById(tokenUser.created_user_id);
          
          if(currentUser.type !=0 ) {
              if(userUpdateParams.params.id != currentUser.id) {
                  return super.failed( null, { message:'Cannot get access to update for this user.'} );
              }
          }
  
          const user = await Model.User.update(userUpdateParams.body, userUpdateParams.params.id);
          return super.success(null, {
                  user: user
                });
      } catch (error) {
        return super.failed(error, "An error while updating the user.");
      }
  }

  static async delete(id) {
      try {
        const deleteUser = await Model.User.getById(id);

        if(!deleteUser){
          return super.failed( null, { message:"User not found!" } );
        }
        await Model.User.delete(id);
  
        return super.success(null, {
          deleteUser: deleteUser
        });
      } catch (error) {
        return super.failed(error, "Error occoured while deleting the user.");
      }
  }
  
  static async changePassword(params) {
      try {
          const tokenUser = await Model.Token.getByTokenString(params.headers.authorization);
          const currentUser = await Model.User.getById(tokenUser.created_user_id);
          
          if(!params.body.oldPassword) {
              throw new CustomError('Current Password is required!', 404);
          }

          const oldPasswordHash = Model.User.hashPassword(params.body.oldPassword);          
          if (currentUser.password !== oldPasswordHash) {
              return super.failed(null,{ message:"Incorrect old password can not get access to change new password" });
          } else if (params.body.newPassword !== params.body.confirmPassword) {
              return super.failed(null, {message:"New password and confirm password must be same."});
          }
          
          await Model.User.change(params.body, currentUser.id);

          return super.success(null, {
          message: "Password changing successfully."
          });
      } catch (error) {
        return super.failed(error, "Error occoured during updating the password.");
      }
  }
}

module.exports = UserService;
