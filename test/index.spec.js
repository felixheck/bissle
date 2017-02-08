const test = require('tape').test;
const _ = require('lodash');
const errors = require('../src/errors');
const { setup } = require('./utils');

test('bissle.pluginOptions >> returns relative links', t => {
  const { host, server } = setup({}, { absolute: false });

  server.inject('/', response => {
    t.equal(_.some(response.result._links, link => _.startsWith(link, host)), false);
    t.end();
  });
});

test('bissle.pluginOptions >> throws error if plugin specific options invalid', t => {
  t.throws(() => setup({}, { foo: true }), /Error/);
  t.end();
});

test('bissle >> request without query parameters', t => {
  const { server } = setup();

  server.inject('/', response => {
    t.equal(response.result.result.length, 9);
    t.equal(response.result.total, 9);
    t.equal(response.result.per_page, 100);
    t.equal(response.result.page, 1);
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last'].sort());
    t.end();
  });
});

test('bissle >> request without query parameters | custom param names', t => {
  const { server } = setup(null, {
    absolute: false,
    paramNames: {
      per_page: 'pageSize',
      page: 'currentPage',
      total: 'totalCount',
    },
  });

  server.inject('/', response => {
    t.equal(response.result.result.length, 9);
    t.equal(response.result.totalCount, 9);
    t.equal(response.result.pageSize, 100);
    t.equal(response.result.currentPage, 1);
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last'].sort());
    t.end();
  });
});

test('bissle >> request with custom "per_page" query parameter | first page', t => {
  const { server } = setup(null, {
    absolute: false,
    paramNames: {
      per_page: 'pageSize',
      page: 'currentPage',
      total: 'totalCount',
    },
  });

  server.inject('/?pageSize=3', response => {
    t.equal(response.result.result.length, 3);
    t.equal(response.result.totalCount, 9);
    t.equal(response.result.pageSize, 3);
    t.equal(response.result.currentPage, 1);
    t.deepEqual(_.map(response.result.result, _.partial(_.get, _, '_id')), ['1', '2', '3']);
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last', 'next'].sort());
    t.end();
  });
});

test('bissle >> request with "per_page" query parameter | first page', t => {
  const { server } = setup();

  server.inject('/?per_page=3', response => {
    t.equal(response.result.result.length, 3);
    t.equal(response.result.total, 9);
    t.equal(response.result.per_page, 3);
    t.equal(response.result.page, 1);
    t.deepEqual(_.map(response.result.result, _.partial(_.get, _, '_id')), ['1', '2', '3']);
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last', 'next'].sort());
    t.end();
  });
});

test('bissle >> request with "page" query parameter | -1', t => {
  const { server } = setup();

  server.inject('/?page=-1', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidQuery);
    t.end();
  });
});

test('bissle >> request with "per_page" query parameter | -1', t => {
  const { server } = setup();

  server.inject('/?per_page=-1', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidQuery);
    t.end();
  });
});

test('bissle >> request with "per_page" query parameter | 1000', t => {
  const { server } = setup();

  server.inject('/?per_page=1000', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidQuery);
    t.end();
  });
});

test('bissle >> request with both query parameters | last page', t => {
  const { server } = setup();

  server.inject('/?page=3&per_page=3', response => {
    t.equal(response.result.result.length, 3);
    t.equal(response.result.total, 9);
    t.equal(response.result.per_page, 3);
    t.equal(response.result.page, 3);
    t.deepEqual(_.map(response.result.result, _.partial(_.get, _, '_id')), ['7', '8', '9']);
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last', 'prev'].sort());
    t.end();
  });
});

test('bissle >> request with both query parameters | not available', t => {
  const { server } = setup();

  server.inject('/?page=4&per_page=3', response => {
    t.equal(response.result.result.length, 0);
    t.equal(response.result.total, 9);
    t.equal(response.result.per_page, 3);
    t.equal(response.result.page, 4);
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last'].sort());
    t.end();
  });
});

test('bissle >> route have no defined ID', t => {
  const { server } = setup();

  server.inject('/page?page=4&per_page=3', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.missingId);
    t.end();
  });
});

test('bissle >> append all passed query parameters', t => {
  const { host, server } = setup();

  server.inject('/?page=4&per_page=3&fields=foo', response => {
    t.equal(response.result._links.self.href, `/?page=4&per_page=3&fields=foo`);
    t.equal(response.result._links.first.href, `/?per_page=3&fields=foo`);
    t.end();
  });
});

test('bissle >> append all passed query parameters | custom param names', t => {
  const { server } = setup(null, {
    absolute: false,
    paramNames: {
      per_page: 'pageSize',
      page: 'currentPage',
      total: 'totalCount',
    },
  });

  server.inject('/?currentPage=4&pageSize=3&fields=foo', response => {
    t.equal(response.result._links.self.href, '/?currentPage=4&pageSize=3&fields=foo');
    t.equal(response.result._links.first.href, '/?pageSize=3&fields=foo');
    t.end();
  });
});

test('bissle >> exposed query schema', t => {
  const { server } = setup();

  t.deepEqual(_.keys(server.plugins.bissle.scheme).sort(), ['page', 'per_page', 'pluginOptions']);
  t.equal(server.plugins.bissle.scheme.page.isJoi, true);
  t.end();
});

test('bissle >> exposed query schema | custom param names', t => {
  const { server } = setup(null, {
    absolute: false,
    paramNames: {
      per_page: 'pageSize',
      page: 'currentPage',
      total: 'totalCount',
    },
  });

  t.deepEqual(_.keys(server.plugins.bissle.scheme).sort(), ['currentPage', 'pageSize', 'pluginOptions']);
  t.equal(server.plugins.bissle.scheme.currentPage.isJoi, true);
  t.end();
});
