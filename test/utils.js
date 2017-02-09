const Hapi = require('hapi');
const akaya = require('akaya');
const qs = require('qs');
const url = require('url');
const plugin = require('../src');
const mockResponse = require('./index.mock');

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
    per_page: 'per_page',
    page: 'page',
    total: 'total',
  },
};

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
const setup = (options, pluginOptions) => {
  pluginOptions = pluginOptions || mockPluginOptions;

  const key = options && options.key || 'result';
  const fixtures = {
    server: new Hapi.Server(),
    host: 'http://localhost:1337/',
  };

  fixtures.server.connection({
    port: 1337,
    host: 'localhost'
  });

  fixtures.server.route([
    {
      method: 'GET',
      path: '/',
      config: {
        id: 'foo',
        handler: function (request, reply) {
          return reply.bissle({ [key]: Array.from(mockResponse) }, options)
        },
      },
    },
    {
      method: 'GET',
      path: '/page',
      config: {
        handler: function (request, reply) {
          return reply.bissle({ [key]: Array.from(mockResponse) }, options)
        },
      },
    },
  ]);

  fixtures.server.register([{
    register: akaya,
  }, {
    register: plugin,
    options: pluginOptions,
  }], err => {});

  return fixtures;
};

const getQueries = path => qs.parse(url.parse(path).query).query;
const getParams = path => qs.parse(url.parse(path).query).params;

module.exports = {
  setup,
  getQueries,
  getParams,
};
