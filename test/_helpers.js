const hapi = require('@hapi/hapi')
const akaya = require('akaya')
const qs = require('qs')
const url = require('url')
const plugin = require('../src')
const mockResponse = require('./fixtures/index')

/**
 * @type {Object}
 * @private
 *
 * @description
 * Mock the plugin options
 */
const mockPluginOptions = {
  absolute: false,
  paramNames: {
    perPage: 'per_page',
    page: 'page',
    total: 'total'
  }
}

/**
 * @function
 * @public
 *
 * @description
 * Setup and expose an Hapi server connection
 *
 * @param {Object} options The route specific options
 * @param {Object} pluginOptions The plugin specific options
 * @returns {Object} The needed fixtures
 */
const setup = async (options, pluginOptions) => {
  pluginOptions = pluginOptions || mockPluginOptions

  const key = (options && options.key) || 'result'
  const fixtures = {
    server: hapi.server({
      port: 1337,
      host: 'localhost'
    }),
    host: 'http://localhost:1337/'
  }

  fixtures.server.route([
    {
      method: 'GET',
      path: '/',
      config: {
        id: 'foo',
        handler (req, h) {
          return h.bissle({ [key]: Array.from(mockResponse) }, options)
        }
      }
    },
    {
      method: 'GET',
      path: '/page',
      config: {
        handler (req, h) {
          return h.bissle({ [key]: Array.from(mockResponse) }, options)
        }
      }
    }
  ])

  await fixtures.server.register([akaya, {
    plugin,
    options: pluginOptions
  }])

  return fixtures
}

const getQueries = path => qs.parse((new url.URL(decodeURIComponent(path))).search.slice(1)).query
const getParams = path => qs.parse((new url.URL(decodeURIComponent(path))).search.slice(1)).params

module.exports = {
  setup,
  getQueries,
  getParams
}
