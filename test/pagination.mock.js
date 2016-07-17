const qs = require('qs');

const akaMock = (id, query) => `/?${qs.stringify(query)}`.replace(/\?$/, '');

const requestObjMock = {
  headers: {},
  connection: {
    info: {
      protocol: 'http',
    }
  },
  info: {
    host: 'localhost:1337',
  },
  url: {
    pathname: '/'
  }
};

module.exports = {
  aka: akaMock,
  requestObj: requestObjMock,
};
