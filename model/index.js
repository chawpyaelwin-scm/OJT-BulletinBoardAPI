const UserModel = require("./user");
const PostModel = require("./post");
const TokenModel = require("./token");
const CommentModel = require("./comment");

module.exports = {
  User: UserModel,
  Post: PostModel,
  Token: TokenModel,
  Comment: CommentModel,
};
