const Excel = require('../excel/excel');
const AbstractService = require('./abstract');
const Model = require("../model");

class ExcelService extends AbstractService {
	constructor() {
		super();
	}
	/**
	 * Generate Excel for download
	 * @param {Object} Input parameter
	 * @return {Object}
	 */
	static async download(data) {		
		try {
			const tokenUser = await Model.Token.getByTokenString(data.headers.authorization);
			const excel = await Excel.generate(tokenUser);
            return super.success(200, excel);
		} catch (error) {
			return super.failed(error, 'An error occured while generating excel');
		}
	}
}

	module.exports = ExcelService;
