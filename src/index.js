const Joi = require('joi');
const Hoek = require('hoek');
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
  scheme: {
    options: {
      per_page: Joi.number()
        .integer()
        .min(1).
        max(500)
        .default(100),
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),
      key: Joi.string()
        .default('result'),
    },
  },
};

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
 * @returns {Function} The predefined pagination link generator
 */
function getPaginationLink(id, perPage, options) {
  perPage = perPage === options.per_page ? undefined : perPage;

  return page => (internals.aka(id, {
    query: {
      page,
      per_page: perPage,
    },
  }));
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
 * @param {number} perPage The number of entries per page
 * @param {number} total The total number of entries
 * @param {Object} options The related options
 * @returns {Object.<?string} The mapping of pagination links
 */
function getPaginationLinks(id, page, perPage, total, options) {
  const getLink = getPaginationLink(id, perPage, options);
  const lastPage = Math.ceil(total / perPage);
  const links = {};


  if (page !== options.page) {
    links.first = getLink(undefined);
  }

  if (page > options.page + 1 && page <= lastPage) {
    links.prev = getLink(page - 1);
  }

  if (page < lastPage - 1) {
    links.next = getLink(page + 1);
  }

  if (page !== lastPage) {
    links.last = getLink(lastPage);
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
 * @returns {string | undefined} Parsed Link header value if links available
 */
function getLinkHeader(links) {
  const linkHeader = [];

  for (const [entity, href] of Object.entries(links)) {
    linkHeader.push(`<${href}>; rel="${entity}"`);
  }

  return linkHeader.join(', ') || undefined;
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
  server.decorate('reply', 'bissle', function decorator(res, options = {}) {
    options = Joi.attempt(options, internals.scheme.options);
    internals.aka = this.request::this.request.aka;

    const total = res[options.key].length;
    const page = parseInt(this.request.query.page, 10);
    const perPage = parseInt(this.request.query.per_page, 10);
    const offset = (page - 1) * perPage;
    const result = res[options.key].splice(offset, perPage);
    const id = this.request.route.settings.id;

    const links = getPaginationLinks(id, page, perPage, total, options);
    const linkHeader = getLinkHeader(links);

    this.response(Object.assign(res, {
      result,
      per_page: perPage,
      page,
      total,
      links,
    })).header('link', linkHeader);
  });

  next();
}

bissle.attributes = {
  pkg,
};

module.exports = {
  register: bissle,
};
