const _ = require('lodash');
const url = require('url');

/**
 * @function
 * @private
 *
 * @description
 * Get parameter value based on the passed condition
 *
 * @param {*} param The parameter to be minimized
 * @param {*} condition The condition to be checked for
 * @returns {* | undefined} The minimized parameter value
 */
function minimizeQueryParameter(param, condition) {
  return param === condition ? undefined : param;
}

/**
 * @function
 * @private
 *
 * @description
 * Get pagination link generator with predefined values
 *
 * @param {string} id The endpoint ID
 * @param {number} per_page The number of entries per page
 * @param {Object} options The related options
 * @param {Object} query The related query parameters
 * @param {Function} aka The request bound akaya function for link building
 * @returns {Function} The predefined pagination link generator
 */
function getPaginationLink(id, per_page, options, query, aka) {
  per_page = minimizeQueryParameter(per_page, options.per_page);

  return page => {
    page = minimizeQueryParameter(page, 1);

    return aka(id, {
      query: Object.assign({}, query, { page, per_page }),
    });
  };
}

/**
 * @function
 * @public
 *
 * @description
 * Get entity/href mapping of necessary pagination links
 *
 * @param {string} id The endpoint ID
 * @param {number} page The requested page
 * @param {number} per_page The number of entries per page
 * @param {number} total The total number of entries
 * @param {Object} options The related options
 * @param {Object} query The related query parameters
 * @param {Function} aka The request bound akaya function for link building
 * @returns {Object.<?string>} The mapping of pagination links
 */
function getPaginationLinks(id, page, per_page, total, options, query, aka) {
  const getLink = getPaginationLink(id, per_page, options, query, aka);
  const lastPage = Math.ceil(total / per_page);
  const links = {};

  links.first = getLink(undefined);

  if (page > 1 && page <= lastPage) {
    links.prev = getLink(page - 1);
  }

  if (page < lastPage && page >= 1) {
    links.next = getLink(page + 1);
  }

  links.last = getLink(lastPage);

  return links;
}

/**
 * @function
 * @public
 * 
 * @description
 * Convert pagination links into relative ones based on options
 * @param {Object} links The links to be optimized
 * @param {Object} pluginOptions The plugin related options
 */
function optimizePaginationLinks(links, pluginOptions) {
  if (!pluginOptions.absolute) {
    _.forOwn(links, (href, entity) => {
      links[entity] = url.parse(href).path;
    });
  }
}

module.exports = {
  getLinks: getPaginationLinks,
  optimizeLinks: optimizePaginationLinks,
};
