const querystring = require('querystring');
const _ = require('lodash');

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
 * Halify links by converting them to objects
 *
 * @param {Object} links The links to be halified
 * @returns {Object} The halified links object
 */
function halifyLinks(links) {
  _.forOwn(links, (href, entity) => {
    links[entity] = {
      href: href
    }
  });
}

/**
 * @function
 * @private
 *
 * @description
 * Get absolute/relative request url
 *
 * @param {Object} request The related request object
 * @param {Object} pluginOptions The plugin related options
 * @returns {string} The request url
 */
function getRequestUrl(request, pluginOptions) {
  const proxyProtocol = request.headers && request.headers['x-forwarded-proto'];
  const protocol = proxyProtocol || request.connection.info.protocol;
  let requestUrl;

  if (pluginOptions.absolute) {
    requestUrl = `${protocol}://${request.info.host}${request.url.pathname}`;
  } else {
    requestUrl = request.url.pathname;
  }

  return requestUrl;
}

/**
 * @function
 * @private
 *
 * @description
 * Get link of the requested resource itself
 *
 * @param {number} page The requested page
 * @param {number} per_page The requested items per page
 * @param {Object} request The related request object
 * @param {Object} options The request related options
 * @param {Object} pluginOptions The plugin related options
 * @returns {string} The generated resource link
 */
function getSelfLink(page, per_page, request, options, pluginOptions) {
  const requestPath = getRequestUrl(request, pluginOptions);

  const query = querystring.stringify(Object.assign({}, request.query, {
    per_page: minimizeQueryParameter(per_page, options.per_page),
    page: minimizeQueryParameter(page, 1),
  }));

  return query ? `${requestPath}?${query}` : requestPath;
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
 * @param {boolean} absolute If the link should be an absolute one
 * @returns {Function} The predefined pagination link generator
 */
function getPaginationLink(id, per_page, options, query, aka, absolute) {
  per_page = minimizeQueryParameter(per_page, options.per_page);

  return page => {
    page = minimizeQueryParameter(page, 1);

    return aka(id, {
      query: Object.assign({}, query, { page, per_page }),
    }, {
      rel: !absolute,
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
 * @param {Object} requestObj The related query parameters
 * @param {Function} aka The request bound akaya function for link building
 * @param {Object} options The related options
 * @param {Object} pluginOptions The plugin related options
 * @returns {Object.<?string>} The mapping of pagination links
 */
function getPaginationLinks(id, page, per_page, total, requestObj, aka, options, pluginOptions) {
  const getLink = getPaginationLink(
    id, per_page, options, requestObj.query, aka, pluginOptions.absolute
  );
  const lastPage = Math.ceil(total / per_page);
  const links = {};

  links.self = getSelfLink(page, per_page, requestObj, options, pluginOptions);
  links.first = getLink(undefined);

  if (page > 1 && page <= lastPage) {
    links.prev = getLink(page - 1);
  }

  if (page < lastPage && page >= 1) {
    links.next = getLink(page + 1);
  }

  links.last = getLink(lastPage);

  halifyLinks(links);

  return links;
}

module.exports = {
  getLinks: getPaginationLinks,
};
