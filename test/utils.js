const Hapi = require('hapi');
const akaya = require('akaya');
const plugin = require('../src');
const mockResponse = require('./index.mock');

/**
 * @function
 * @public
 * 
 * @description
 * Setup and expose an Hapi server connection
 * 
 * @returns {Object} The needed fixtures
 */
const setup = (options) => {
  const fixtures = {
    server: new Hapi.Server(),
  };

  fixtures.server.connection({
    port: 1337,
    host: 'localhost'
  });

  fixtures.server.route({
    method: 'GET',
    path: '/',
    config: {
      id: 'foo',
      handler: function (request, reply) {
        return reply.bissle({result: Array.from(mockResponse)}, options)
      },
    },
  });
  
  fixtures.server.register([akaya, plugin], err => {});

  return fixtures;
};

module.exports = {
  setup,
};
