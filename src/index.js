const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');
const errors = require('./errors');
const pkg = require('../package.json');

/**
 * @type {Object}
 * @private
 *
 * @description
 * Store internal objects
 */
const internals = {
  aka: null,
  max_per_page: 500,
  defaults: {
    per_page: 100,
    key: 'result',
  },
  scheme: {
    per_page: Joi.number()
      .integer()
      .min(1).
      max(500)
      .default(100),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
  },
};

/**
 * @function
 * @private
 *
 * @description
 * Validate the passed in options
 *
 * @param {Object} options The options to be validated
 * @returns {boolean} The options are valid
 */
function validateOptions(options) {
  options.per_page = _.toInteger(options.per_page);

  return _.isString(options.key)
    && _.inRange(options.per_page, 1, internals.max_per_page + 1);
}

/**
 * @function
 * @private
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

  return query.page >= 1
    && _.inRange(query.per_page, 1, internals.max_per_page + 1);
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
 * @returns {Function} The predefined pagination link generator
 */
function getPaginationLink(id, per_page, options) {
  per_page = per_page === options.per_page ? undefined : per_page;

  return page => {
    page = page === 1 ? undefined : page;

    return internals.aka(id, {
      query: {
        page,
        per_page,
      },
    });
  };
}

/**
 * @function
 * @private
 *
 * @description
 * Get entity/href mapping of necessary pagination links
 *
 * @param {string} id The endpoint ID
 * @param {number} page The requested page
 * @param {number} per_page The number of entries per page
 * @param {number} total The total number of entries
 * @param {Object} options The related options
 * @returns {Object.<?string} The mapping of pagination links
 */
function getPaginationLinks(id, page, per_page, total, options) {
  const getLink = getPaginationLink(id, per_page, options);
  const lastPage = Math.ceil(total / per_page);
  const links = {
    first: getLink(undefined),
    last: getLink(lastPage),
  };

  if (page > 2 && page <= lastPage) {
    links.prev = getLink(page - 1);
  }

  if (page < lastPage - 1) {
    links.next = getLink(page + 1);
  }

  return links;
}

/**
 * @function
 * @private
 *
 * @description
 * Get Link header value based on pagination links
 *
 * @param {Object.<?string>} links The entity/href mapping of pagination links
 * @returns {string} Parsed Link header value if links available
 */
function getLinkHeader(links) {
  const linkHeader = [];

  _.forOwn(links, (entity, href) => {
    linkHeader.push(`<${href}>; rel="${entity}"`);
  });

  return linkHeader.join(', ');
}

/**
 * @function
 * @public
 *
 * @description
 * Plugin to generate URIs based on ID and parameters
 *
 * @param {Object} server The server to be extended
 * @param {Object} pluginOptions The plugin options
 * @param {Function} next The callback to continue in the chain of plugins
 */
function bissle(server, pluginOptions, next) {
  server.dependency('akaya');

  server.expose('schema', internals.scheme);

  server.decorate('reply', 'bissle', function decorator(res, options) {
    internals.aka = this.request::this.request.aka;
    options = Object.assign({}, internals.defaults, options);

    if (!validateOptions(options)) {
      return this.response(Boom.badRequest(errors.invalidOptions));
    }

    if (!validateQuery(this.request.query, options)) {
      return this.response(Boom.badRequest(errors.invalidQuery));
    }

    const { page, per_page } = this.request.query;
    const offset = (page - 1) * per_page;
    const total = res[options.key].length;
    const result = res[options.key].splice(offset, per_page);
    const id = this.request.route.settings.id;

    if (!id) {
      return this.response(Boom.badRequest(errors.missingId));
    }

    const links = getPaginationLinks(id, page, per_page, total, options);
    const linkHeader = getLinkHeader(links);

    this.response(Object.assign(res, {
      per_page,
      result,
      page,
      total,
      links,
    })).header('link', linkHeader);
  });

  return next();
}

bissle.attributes = {
  pkg,
};

module.exports = {
  register: bissle,
};
