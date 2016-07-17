/*!
 * @author Felix Heck <hi@whoTheHeck.de>
 * @version 0.4.0
 * @copyright Felix Heck 2016
 * @license MIT
 */

const Joi = require('joi');
const Boom = require('boom');
const errors = require('./errors');
const validate = require('./validate');
const header = require('./header');
const pagination = require('./pagination');
const pkg = require('../package.json');

/**
 * @type {Object}
 * @private
 *
 * @description
 * Store internal objects
 */
const internals = {
  defaults: {
    per_page: 100,
    key: 'result',
  },
  scheme: {
    per_page: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .default(100),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    pluginOptions: Joi.object({
      absolute: Joi.boolean().default(false),
    }),
  },
};

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
  pluginOptions = Joi.attempt(pluginOptions, internals.scheme.pluginOptions);

  server.expose('scheme', internals.scheme);
  server.dependency('akaya');

  server.decorate('reply', 'bissle', function decorator(res, options) {
    options = Object.assign({}, internals.defaults, options);

    if (!validate.options(options)) {
      return this.response(Boom.badRequest(errors.invalidOptions));
    }

    if (!validate.query(this.request.query, options)) {
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

    const links = pagination.getLinks(
      id, page, per_page, total, this.request,
      this.request::this.request.aka, options, pluginOptions
    );

    const linkHeader = header.getLink(links);

    this.response(Object.assign(res, {
      [options.key]: result,
      _links: links,
      per_page,
      page,
      total,
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
