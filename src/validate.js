const _ = require('lodash');

/**
 * @function
 * @private
 *
 * @description
 * Validate the total parameter in the query or the options
 *
 * @param {number} total The per_page parameter to be validated
 * @returns {boolean} The parameter is valid
 */
function validateTotal(total) {
  return _.toInteger(total) >= 0 && !_.isString(total);
}

/**
 * @function
 * @private
 *
 * @description
 * Validate the per_page parameter in the query or the options
 *
 * @param {number} per_page The per_page parameter to be validated
 * @returns {boolean} The parameter is valid
 */
function validatePerPage(per_page) {
  return _.inRange(_.toInteger(per_page), 1, 500 + 1);
}

/**
 * @function
 * @public
 *
 * @description
 * Validate the passed in options
 *
 * @param {Object} options The options to be validated
 * @returns {boolean} The options are valid
 */
function validateOptions(options) {
  return _.isString(options.key) &&
    validatePerPage(options.per_page) &&
    validateTotal(options.total);
}

/**
 * @function
 * @public
 *
 * @description
 * Validate the passed query parameters
 *
 * @param {Object} query The query object to be validated
 * @param {Object} options The related options
 * @returns {Object} The query parameters are valid
 */
function validateQuery(query, options) {
  query.per_page = _.toInteger(query.per_page || options.per_page);
  query.page = _.toInteger(query.page || 1);

  return query.page >= 1 && validatePerPage(query.per_page);
}


module.exports = {
  options: validateOptions,
  query: validateQuery,
};
