'use strict'

const CustomErrors = require('../utils/customErrors');
const CustomError = CustomErrors.CustomError;

class AbstractService {

	/**
	 * Create a response on success.
	 * @param {number} statusCode HTTP status code
	 * @param {Object} result Execution result
	 * @param {Object} headers Custom header
	 * @return {Object} API response
	 */
	static success(statusCode, result, headers) {

		if (!statusCode) {
			statusCode = (result === '' || result === null || result === undefined) ? 204 : 200;
		}

		const response = {
			body: {
				statusCode: statusCode,
				errors: []
			},
			headers: headers
		};

		if (typeof result === 'object') {
			response.body = { ...response.body, ...result };
		}

		return response;

	}

	/**
	 * Create a failure response.
	 * @param {Error|CustomError} Error object
	 * @param {string} message Error message
	 * @param {number} statusCode HTTP status code
	 * @param {Array.<Object>} errors Array of error detail objects
	 * @param {Object} headers Custom header
	 * @return {Object} ServiceResponse
	 */
	static failed(error, message, statusCode, errors, headers) {

		if (!statusCode) {
			statusCode = 500;
		}

		let customError;
		if (error instanceof CustomError) {
			customError = error;
		} else {
			console.log(error);
			customError = new CustomError(message, statusCode, errors);
		}

		const response = {
			body: {
				statusCode: customError.statusCode,
				errors: customError.errors
			},
			headers: headers
		};

		return response;

	}

	/**
	 * If a CustomError object is passed, throw it as it is. Otherwise, create a CustomError object and throw it.
	 * @param {CustomError|Error} error Error object
	 * @param {string} message Error message
	 * @param {number} statusCode HTTP status code
	 * @param {Array.<Object>} errors Array of error detail objects
	 * @throws {CustomError} CustomError
	 */
	static throwCustomError(error, message, statusCode, errors) {

		if (!statusCode) {
			statusCode = 500;
		}

		if (error instanceof CustomError) {
			throw error;
		} else {
			console.log(error);
			throw new CustomError(message, statusCode, errors);
		}

	}

}

module.exports = AbstractService;
