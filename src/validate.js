const _ = require('lodash')

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
function validateTotal (total) {
  return _.toInteger(total) >= 0 && !_.isString(total)
}

/**
 * @function
 * @private
 *
 * @description
 * Validate the per_page parameter in the query or the options
 *
 * @param {number} perPage The per_page parameter to be validated
 * @returns {boolean} The parameter is valid
 */
function validatePerPage (perPage) {
  return _.inRange(_.toInteger(perPage), 1, 500 + 1)
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
function validateOptions (options) {
  return _.isString(options.key) &&
    validatePerPage(options.perPage) &&
    validateTotal(options.total)
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
 * @param {Object} paramNames The names of the query params
 * @returns {Object} The query parameters are valid
 */
function validateQuery (query, options, paramNames) {
  query[paramNames.perPage] = _.toInteger(query[paramNames.perPage] || options.perPage)
  query[paramNames.page] = _.toInteger(query[paramNames.page] || 1)

  return query[paramNames.page] >= 1 && validatePerPage(query[paramNames.perPage])
}

module.exports = {
  options: validateOptions,
  query: validateQuery
}
