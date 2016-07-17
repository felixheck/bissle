const test = require('tape').test;
const qs = require('qs');
const _ = require('lodash');
const { getQueries } = require('./utils');
const pagination = require('../src/pagination');

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

test('bissle/pagination.getLinks >> has no prev HAL link | first page', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 1, 3, 9, requestObjMock, akaMock, options, {});

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), true);
  t.equal(_.has(result, 'last'), true);
  t.end();
});

test('bissle/pagination.getLinks >> has no next HAL link | last page', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 3, 3, 9, requestObjMock, akaMock, options, {});

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), true);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});

test('bissle/pagination.getLinks >> has all HAL links | middle page', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 2, 3, 9, requestObjMock, akaMock, options, {});

  t.equal(_.has(result, 'first'), true);
  t.deepEqual(getQueries(result.first.href), {
    per_page: '3',
  });

  t.equal(_.has(result, 'prev'), true);
  t.deepEqual(getQueries(result.prev.href), {
    per_page: '3',
  });

  t.equal(_.has(result, 'next'), true);
  t.deepEqual(getQueries(result.next.href), {
    per_page: '3',
    page: '3',
  });

  t.equal(_.has(result, 'last'), true);
  t.deepEqual(getQueries(result.last.href), {
    per_page: '3',
    page: '3',
  });

  t.end();
});

test('bissle/pagination.getLinks >> has all HAL links | customized middle page ', t => {
  const options = { per_page: 3 };
  const result = pagination.getLinks('foo', 2, 3, 9, requestObjMock, akaMock, options, {});

  t.equal(_.has(result, 'first'), true);
  t.equal(getQueries(result.first.href), undefined, 'first');

  t.equal(_.has(result, 'prev'), true);
  t.equal(getQueries(result.prev.href), undefined, 'prev');

  t.equal(_.has(result, 'next'), true);
  t.deepEqual(getQueries(result.next.href), {
    page: '3',
  });

  t.equal(_.has(result, 'last'), true);
  t.deepEqual(getQueries(result.last.href), {
    page: '3',
  });

  t.end();
});

test('bissle/pagination.getLinks >> has no prev/next HAL links | page is zero', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 0, 3, 9, requestObjMock, akaMock, options, {});

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});


test('bissle/pagination.getLinks >> has no prev/next HAL links | page is too high', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 4, 3, 9, requestObjMock, akaMock, options, {});

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});
