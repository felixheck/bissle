const test = require('tape').test;
const _ = require('lodash');
const errors = require('../src/errors');
const { setup } = require('./utils');

test('bissle >> request without query parameters', t => {
  const { server } = setup();

  server.inject('/', response => {
    t.equal(response.result.result.length, 9);
    t.equal(response.result.total, 9);
    t.equal(response.result.per_page, 100);
    t.equal(response.result.page, 1);
    t.deepEqual(_.keys(response.result.links).sort(), ['first', 'last']);
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
    t.deepEqual(_.keys(response.result.links).sort(), ['first', 'last', 'next']);
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
    t.deepEqual(_.keys(response.result.links).sort(), ['first', 'last', 'prev']);
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
    t.deepEqual(_.keys(response.result.links).sort(), ['first', 'last']);
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
    console.log(response.result.links.first);
    t.equal(response.result.links.first, `${host}?per_page=3&fields=foo`);
    t.end();
  });
});

test('bissle >> exposed query schema', t => {
  const { server } = setup();

  t.deepEqual(_.keys(server.plugins.bissle.scheme).sort(), ['page', 'per_page']);
  t.equal(server.plugins.bissle.scheme.page.isJoi, true);
  t.end();
});
