const test = require('tape').test;
const qs = require('qs');
const _ = require('lodash');
const { getQueries } = require('./utils');
const pagination = require('../src/pagination');

const akaMock = (id, query) => `/?${qs.stringify(query)}`.replace(/\?$/, '');

test('bissle/pagination.getLinks >> has no prev HAL link | first page', t => {
  const result = pagination.getLinks('foo', 1, 3, 9, { per_page: 1 }, {}, akaMock);

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), true);
  t.equal(_.has(result, 'last'), true);
  t.end();
});

test('bissle/pagination.getLinks >> has no next HAL link | last page', t => {
  const result = pagination.getLinks('foo', 3, 3, 9, { per_page: 1 }, {}, akaMock);

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), true);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});

test('bissle/pagination.getLinks >> has all HAL links | middle page', t => {
  const result = pagination.getLinks('foo', 2, 3, 9, { per_page: 1 }, {}, akaMock);

  t.equal(_.has(result, 'first'), true);
  t.deepEqual(getQueries(result.first), {
    per_page: '3',
  });

  t.equal(_.has(result, 'prev'), true);
  t.deepEqual(getQueries(result.prev), {
    per_page: '3',
  });

  t.equal(_.has(result, 'next'), true);
  t.deepEqual(getQueries(result.next), {
    per_page: '3',
    page: '3',
  });

  t.equal(_.has(result, 'last'), true);
  t.deepEqual(getQueries(result.last), {
    per_page: '3',
    page: '3',
  });

  t.end();
});

test('bissle/pagination.getLinks >> has all HAL links | customized middle page ', t => {
  const result = pagination.getLinks('foo', 2, 3, 9, { per_page: 3 }, {}, akaMock);

  t.equal(_.has(result, 'first'), true);
  t.equal(getQueries(result.first), undefined);

  t.equal(_.has(result, 'prev'), true);
  t.equal(getQueries(result.prev), undefined);

  t.equal(_.has(result, 'next'), true);
  t.deepEqual(getQueries(result.next), {
    page: '3',
  });

  t.equal(_.has(result, 'last'), true);
  t.deepEqual(getQueries(result.last), {
    page: '3',
  });

  t.end();
});

test('bissle/pagination.getLinks >> has no prev/next HAL links | page is zero', t => {
  const result = pagination.getLinks('foo', 0, 3, 9, { per_page: 1 }, {}, akaMock);

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});


test('bissle/pagination.getLinks >> has no prev/next HAL links | page is too high', t => {
  const result = pagination.getLinks('foo', 4, 3, 9, { per_page: 1 }, {}, akaMock);

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});

test('bissle/pagination.optimizeLinks >> converts links into relative ones', t => {
  const links = { next: 'http://localhost:1337/?page=2' };
  const pluginOptions = { absolute: false };

  pagination.optimizeLinks(links, pluginOptions);

  t.equal(_.some(links, link => _.startsWith(link, 'http://localhost:1337/')), false);
  t.end();
});

test('bissle/pagination.optimizeLinks >> does not convert links into relative ones', t => {
  const links = { next: 'http://localhost:1337/?page=2' };
  const pluginOptions = { absolute: true };

  pagination.optimizeLinks(links, pluginOptions);

  t.equal(_.every(links, link => _.startsWith(link, 'http://localhost:1337/')), true);
  t.end();
});