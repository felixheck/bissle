const test = require('tape').test;
const _ = require('lodash');
const { getQueries, getParams } = require('./utils');
const pagination = require('../src/pagination');
const paginationMock = require('./pagination.mock');

const requestObjMock = paginationMock.requestObj;
const akaMock = paginationMock.aka;

const pluginOptions = {
  paramNames: {
    per_page: 'per_page',
    page: 'page',
    total: 'total',
  },
};

test('bissle/pagination.getLinks >> has no prev HAL link | first page', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 1, 3, 9, requestObjMock, akaMock, options, pluginOptions);

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), true);
  t.equal(_.has(result, 'last'), true);
  t.end();
});

test('bissle/pagination.getLinks >> has no next HAL link | last page', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 3, 3, 9, requestObjMock, akaMock, options, pluginOptions);

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), true);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});

test('bissle/pagination.getLinks >> has all HAL links | middle page', t => {
  const customPluginOptions = {
    paramNames: {
      per_page: 'pageSize',
      page: 'currentPage',
      total: 'totalCount',
    },
  };

  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 2, 3, 9, requestObjMock, akaMock, options, customPluginOptions);

  t.equal(_.has(result, 'first'), true);
  t.deepEqual(getQueries(result.first.href), {
    pageSize: '3',
  });

  t.equal(_.has(result, 'prev'), true);
  t.deepEqual(getQueries(result.prev.href), {
    pageSize: '3',
  });

  t.equal(_.has(result, 'next'), true);
  t.deepEqual(getQueries(result.next.href), {
    pageSize: '3',
    currentPage: '3',
  });

  t.equal(_.has(result, 'last'), true);
  t.deepEqual(getQueries(result.last.href), {
    pageSize: '3',
    currentPage: '3',
  });

  t.end();
});

test('bissle/pagination.getLinks >> has all HAL links | middle page | custom param names', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 2, 3, 9, requestObjMock, akaMock, options, pluginOptions);

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
  const result = pagination.getLinks('foo', 2, 3, 9, requestObjMock, akaMock, options, pluginOptions);

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
  const result = pagination.getLinks('foo', 0, 3, 9, requestObjMock, akaMock, options, pluginOptions);

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});


test('bissle/pagination.getLinks >> has no prev/next HAL links | page is too high', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 4, 3, 9, requestObjMock, akaMock, options, pluginOptions);

  t.equal(_.has(result, 'first'), true);
  t.equal(_.has(result, 'prev'), false);
  t.equal(_.has(result, 'next'), false);
  t.equal(_.has(result, 'last'), true);
  t.end();
});

test('bissle/pagination.getLinks >> passes request.params to aka', t => {
  const options = { per_page: 1 };
  const result = pagination.getLinks('foo', 2, 1, 5, requestObjMock, akaMock, options, pluginOptions);

  t.equal(_.has(result, 'first'), true);
  t.deepEqual(getParams(result.first.href), {
      id: '1',
  });
  t.equal(_.has(result, 'prev'), true);
  t.deepEqual(getParams(result.prev.href), {
      id: '1',
  });
  t.equal(_.has(result, 'next'), true);
  t.deepEqual(getParams(result.next.href), {
      id: '1',
  });
  t.equal(_.has(result, 'last'), true);
  t.deepEqual(getParams(result.last.href), {
      id: '1',
  });
  t.end();
});
