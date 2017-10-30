const qs = require('qs')
const _ = require('lodash')

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
function minimizeQueryParameter (param, condition) {
  return param === condition ? undefined : param
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
function halifyLinks (links) {
  _.forOwn(links, (href, entity) => {
    links[entity] = { href }
  })
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
function getRequestUrl (request, pluginOptions) {
  const proxyProtocol = request.headers && request.headers['x-forwarded-proto']
  const protocol = proxyProtocol || request.server.info.protocol || 'http'
  let requestUrl = request.url.pathname

  if (pluginOptions.absolute) {
    requestUrl = `${protocol}://${request.info.host}${requestUrl}`
  }

  return requestUrl
}

/**
 * @function
 * @private
 *
 * @description
 * Get link of the requested resource itself
 *
 * @param {number} page The requested page
 * @param {number} perPage The requested items per page
 * @param {Object} request The related request object
 * @param {Object} options The request related options
 * @param {Object} pluginOptions The plugin related options
 * @returns {string} The generated resource link
 */
function getSelfLink (page, perPage, request, options, pluginOptions) {
  const requestPath = getRequestUrl(request, pluginOptions)

  const paramNames = pluginOptions.paramNames
  const query = qs.stringify(Object.assign({}, request.query, {
    [paramNames.perPage]: minimizeQueryParameter(perPage, options.perPage),
    [paramNames.page]: minimizeQueryParameter(page, 1)
  }))

  return query ? `${requestPath}?${query}` : requestPath
}

/**
 * @function
 * @private
 *
 * @description
 * Get pagination link generator with predefined values
 *
 * @param {string} id The endpoint ID
 * @param {number} perPage The number of entries per page
 * @param {Object} options The related options
 * @param {Object} requestObj The related query parameters
 * @param {Function} aka The request bound akaya function for link building
 * @param {boolean} absolute If the link should be an absolute one
 * @param {Object} paramNames The names of the query params
 * @returns {Function} The predefined pagination link generator
 */
function getPaginationLink (id, perPage, options, requestObj, aka, absolute, paramNames) {
  perPage = minimizeQueryParameter(perPage, options.perPage)

  return (page) => {
    page = minimizeQueryParameter(page, 1)

    return aka(id, {
      query: Object.assign({}, requestObj.query, {
        [paramNames.page]: page,
        [paramNames.perPage]: perPage
      }),
      params: requestObj.params
    }, { rel: !absolute })
  }
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
 * @param {number} perPage The number of entries per page
 * @param {number} total The total number of entries
 * @param {Object} requestObj The related query parameters
 * @param {Function} aka The request bound akaya function for link building
 * @param {Object} options The related options
 * @param {Object} pluginOptions The plugin related options
 * @returns {Object.<?string>} The mapping of pagination links
 */
function getPaginationLinks (id, page, perPage, total, requestObj, aka, options, pluginOptions) {
  const getLink = getPaginationLink(
    id, perPage, options, requestObj, aka, pluginOptions.absolute, pluginOptions.paramNames
  )
  const lastPage = Math.ceil(total / perPage)
  const links = {}

  links.self = getSelfLink(page, perPage, requestObj, options, pluginOptions)
  links.first = getLink(undefined)

  if (page > 1 && page <= lastPage) {
    links.prev = getLink(page - 1)
  }

  if (page < lastPage && page >= 1) {
    links.next = getLink(page + 1)
  }

  links.last = getLink(lastPage)

  halifyLinks(links)

  return links
}

module.exports = {
  getLinks: getPaginationLinks
}
