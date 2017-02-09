/*!
 * @author Felix Heck <hi@whoTheHeck.de>
 * @version 1.0.0
 * @copyright Felix Heck 2016-2017
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
    total: null,
    per_page: 100,
    key: 'result',
  },
  scheme: {
    pluginOptions: Joi.object({
      absolute: Joi.boolean().default(false),
      paramNames: Joi
        .object({
          per_page: Joi.string().default('per_page'),
          page: Joi.string().default('page'),
          total: Joi.string().default('total'),
        })
        .default({
          per_page: 'per_page',
          page: 'page',
          total: 'total',
        }),
    }),
  },
};

/**
 * @function
 * @private
 *
 * @description
 * Update schemes based on pluginOption.paramNames
 *
 * @param {Object.<string>} paramNames The passed updated paramNames
 */
function setParamScheme(paramNames) {
  console.log(internals.scheme);
  internals.scheme = {
    pluginOptions: internals.scheme.pluginOptions,
    [paramNames.per_page]: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .default(100),
    [paramNames.page]: Joi.number()
      .integer()
      .min(1)
      .default(1),
  };
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
  pluginOptions = Joi.attempt(pluginOptions, internals.scheme.pluginOptions);

  const paramNames = pluginOptions.paramNames;
  setParamScheme(paramNames);

  server.expose('scheme', internals.scheme);
  server.dependency('akaya');

  server.decorate('reply', 'bissle', function decorator(res, options) {
    let result;
    let total;

    options = Object.assign({}, internals.defaults, options);

    if (!validate.options(options)) {
      return this.response(Boom.badRequest(errors.invalidOptions));
    }

    if (!validate.query(this.request.query, options, pluginOptions.paramNames)) {
      return this.response(Boom.badRequest(errors.invalidQuery));
    }

    const page = this.request.query[paramNames.page];
    const per_page = this.request.query[paramNames.per_page];
    const offset = (page - 1) * per_page;

    if (options.total !== null) {
      total = options.total;
      result = res[options.key];
    } else {
      total = res[options.key].length;
      result = res[options.key].splice(offset, per_page);
    }

    const id = this.request.route.settings.id;

    if (!id) {
      return this.response(Boom.badRequest(errors.missingId));
    }

    const links = pagination.getLinks(
      id, page, per_page, total, this.request,
      this.request::this.request.aka, options, pluginOptions
    );

    const linkHeader = header.getLink(links);

    return this.response(Object.assign(res, {
      [options.key]: result,
      _links: links,
      [paramNames.per_page]: per_page,
      [paramNames.page]: page,
      [paramNames.total]: total,
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
