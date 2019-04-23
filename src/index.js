const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const errors = require('./errors')
const validate = require('./validate')
const header = require('./header')
const pagination = require('./pagination')
const pkg = require('../package.json')

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
    perPage: 100,
    key: 'result'
  },
  scheme: {
    pluginOptions: Joi.object({
      absolute: Joi.boolean().default(false),
      paramNames: Joi
        .object({
          perPage: Joi.string().default('per_page'),
          page: Joi.string().default('page'),
          total: Joi.string().default('total')
        })
        .default({
          perPage: 'per_page',
          page: 'page',
          total: 'total'
        })
    })
  }
}

/**
 * @function
 * @private
 *
 * @description
 * Update schemes based on pluginOption.paramNames
 *
 * @param {Object.<string>} paramNames The passed updated paramNames
 */
function setParamScheme (paramNames) {
  internals.scheme = {
    pluginOptions: internals.scheme.pluginOptions,
    [paramNames.perPage]: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .default(100),
    [paramNames.page]: Joi.number()
      .integer()
      .min(1)
      .default(1)
  }
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
 */
function bissle (server, pluginOptions) {
  pluginOptions = Joi.attempt(pluginOptions, internals.scheme.pluginOptions)

  const paramNames = pluginOptions.paramNames
  setParamScheme(paramNames)

  server.expose('scheme', internals.scheme)
  server.dependency('akaya')

  server.decorate('toolkit', 'bissle', function decorator (res, options) {
    let result
    let total

    options = Object.assign({}, internals.defaults, options)

    if (!validate.options(options)) {
      throw Boom.badRequest(errors.invalidOptions)
    }

    if (!validate.query(this.request.query, options, pluginOptions.paramNames)) {
      throw Boom.badRequest(errors.invalidQuery)
    }
    const page = this.request.query[paramNames.page]
    const perPage = this.request.query[paramNames.perPage]
    const offset = (page - 1) * perPage

    if (options.total !== null) {
      total = options.total
      result = res[options.key]
    } else {
      total = res[options.key].length
      result = res[options.key].splice(offset, perPage)
    }

    const id = this.request.route.settings.id

    if (!id) {
      throw Boom.badRequest(errors.missingId)
    }

    const links = pagination.getLinks(
      id, page, perPage, total, this.request,
      this.request.aka.bind(this.request), options, pluginOptions
    )

    const linkHeader = header.getLink(links)

    return this.response(Object.assign(res, {
      [options.key]: result,
      _links: links,
      [paramNames.perPage]: perPage,
      [paramNames.page]: page,
      [paramNames.total]: total
    })).header('link', linkHeader)
  })
}

module.exports = {
  register: bissle,
  pkg
}
