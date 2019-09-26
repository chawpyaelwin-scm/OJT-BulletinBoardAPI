"use strict";
var connection = require('./database');
const AbstractModel = require('./abstract');

class TokenModel extends AbstractModel{

  /**
   * Save logined user in session 
   * @param {Integer} id
   * @param {String} email
   * @param {String} token
   * @param {Integer} created_user_id
   */
  static async save(email, userId, token) {    
    const id =super.generateId();
    const query_str = `INSERT INTO session (id, email, token,created_user_id) VALUES('${id}', '${email}', '${token}', '${userId}')`;
  
    await connection.query(query_str);
    return token;
  }

  /**
   * Get a token string
   * @param {string} tokenString
   * @return {TokenModel|null}
   */
  static async getByTokenString(tokenString) {
    const items = await this._getByTokenString(tokenString);
    return items;
  }

  /**
   * get user with a token string in session。
   * @param {string} tokenString
   * @return {Object|null}
   */
  static async _getByTokenString(tokenString) {
    const query_str = `SELECT * FROM session WHERE token = '${tokenString}'`;
    const result = await connection.query(query_str);
    return result[0];
  }

  /**
   * delete user with token in session
   * @param {string} tokenString
   * @returns {object}
   */
  static async delete(tokenString) {
    const query_str = `DELETE FROM session WHERE token = '${tokenString}'`;
    const result = await connection.query(query_str);
    
    return result.rows;
  }
}

module.exports = TokenModel;
