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
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last', 'next'].sort());
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

test('bissle/options >> adjust the total option', t => {
  const { server } = setup({ total: 5 });

  server.inject('/?page=2&per_page=2', response => {
    t.equal(response.result.result.length, 9);
    t.equal(response.result.total, 5);
    t.equal(response.result.per_page, 2);
    t.equal(response.result.page, 2);
    t.equal(response.result._links.last.href, '/?page=3&per_page=2');
    t.end();
  });
});

test('bissle/options >> adjust the total option | -1', t => {
  const { server } = setup({ total: -1 });

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidOptions);
    t.end();
  });
});

test('bissle/options >> adjust the total option | \'foo\'', t => {
  const { server } = setup({ total: 'foo' });

  server.inject('/?page=2&per_page=2', response => {
    t.equal(response.result.statusCode, 400);
    t.equal(response.result.message, errors.invalidOptions);
    t.end();
  });
});


test('bissle/options >> adjust the default access key', t => {
  const { server } = setup({ key: 'foo' });

  server.inject('/', response => {
    t.equal(response.result.foo.length, 9);
    t.equal(response.result.total, 9);
    t.equal(response.result.per_page, 100);
    t.equal(response.result.page, 1);
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last'].sort());
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