const test = require('tape').test;
const _ = require('lodash');
const errors = require('../src/errors');
const { setup } = require('./utils');

test('bissle/options >> adjust the default entries per page', t => {
  const { server } = setup({ per_page: 3 });

  server.inject('/', response => {
    t.equal(response.result.result.length, 3);
    t.equal(response.result.total, 9);
    t.equal(response.result.per_page, 3);
    t.equal(response.result.page, 1);
    t.deepEqual(_.keys(response.result.links).sort(), ['first', 'last', 'next']);
    t.end();
  });
});

test('bissle/options >> adjust the default entries per page | 1000', t => {
  const { server } = setup({ per_page: 1000 });

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidOptions);
    t.end();
  });
});

test('bissle/options >> adjust the default entries per page | 0', t => {
  const { server } = setup({ per_page: 0 });

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidOptions);
    t.end();
  });
});

test('bissle/options >> adjust the default access key', t => {
  const { server } = setup({ key: 'foo' });

  server.inject('/', response => {
    t.equal(response.result.result.length, 9);
    t.equal(response.result.total, 9);
    t.equal(response.result.per_page, 100);
    t.equal(response.result.page, 1);
    t.deepEqual(_.keys(response.result.links).sort(), ['first', 'last']);
    t.end();
  });
});

test('bissle/options >> adjust the default access key | 0', t => {
  const { server } = setup({ key: 0 });

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidOptions);
    t.end();
  });
});

test('bissle/options >> adjust the default entries per page | undefined', t => {
  const { server } = setup({ key: undefined });

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidOptions);
    t.end();
  });
});