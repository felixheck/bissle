const test = require('ava')
const _ = require('lodash')
const { getQueries, getParams } = require('./_helpers')
const pagination = require('../src/pagination')
const { requestObj, aka } = require('./fixtures/pagination')

const pluginOptions = {
  paramNames: {
    perPage: 'per_page',
    page: 'page',
    total: 'total'
  }
}

test('first page has no prev HAL link', (t) => {
  const options = { perPage: 1 }
  const result = pagination.getLinks('foo', 1, 3, 9, requestObj, aka, options, pluginOptions)

  t.truthy(_.has(result, 'first'))
  t.falsy(_.has(result, 'prev'), false)
  t.truthy(_.has(result, 'next'), true)
  t.truthy(_.has(result, 'last'), true)
})

test('last page has no next HAL link', (t) => {
  const options = { perPage: 1 }
  const result = pagination.getLinks('foo', 3, 3, 9, requestObj, aka, options, pluginOptions)

  t.truthy(_.has(result, 'first'), true)
  t.truthy(_.has(result, 'prev'), true)
  t.falsy(_.has(result, 'next'), false)
  t.truthy(_.has(result, 'last'), true)
})

test('middle page has all HAL links', (t) => {
  const customPluginOptions = {
    paramNames: {
      perPage: 'pageSize',
      page: 'currentPage',
      total: 'totalCount'
    }
  }

  const options = { perPage: 1 }
  const result = pagination.getLinks('foo', 2, 3, 9, requestObj, aka, options, customPluginOptions)

  t.truthy(_.has(result, 'first'))
  t.deepEqual(getQueries(result.first.href), {
    pageSize: '3'
  })

  t.truthy(_.has(result, 'prev'))
  t.deepEqual(getQueries(result.prev.href), {
    pageSize: '3'
  })

  t.truthy(_.has(result, 'next'))
  t.deepEqual(getQueries(result.next.href), {
    pageSize: '3',
    currentPage: '3'
  })

  t.truthy(_.has(result, 'last'))
  t.deepEqual(getQueries(result.last.href), {
    pageSize: '3',
    currentPage: '3'
  })
})

test('middle page has all HAL links | custom param names', (t) => {
  const options = { perPage: 1 }
  const result = pagination.getLinks('foo', 2, 3, 9, requestObj, aka, options, pluginOptions)

  t.truthy(_.has(result, 'first'))
  t.deepEqual(getQueries(result.first.href), {
    per_page: '3'
  })

  t.truthy(_.has(result, 'prev'))
  t.deepEqual(getQueries(result.prev.href), {
    per_page: '3'
  })

  t.truthy(_.has(result, 'next'))
  t.deepEqual(getQueries(result.next.href), {
    per_page: '3',
    page: '3'
  })

  t.truthy(_.has(result, 'last'))
  t.deepEqual(getQueries(result.last.href), {
    per_page: '3',
    page: '3'
  })
})

test('customized middle page has all HAL links', (t) => {
  const options = { perPage: 3 }
  const result = pagination.getLinks('foo', 2, 3, 9, requestObj, aka, options, pluginOptions)

  t.truthy(_.has(result, 'first'))
  t.is(getQueries(result.first.href), undefined, 'first')

  t.truthy(_.has(result, 'prev'))
  t.is(getQueries(result.prev.href), undefined, 'prev')

  t.truthy(_.has(result, 'next'))
  t.deepEqual(getQueries(result.next.href), {
    page: '3'
  })

  t.truthy(_.has(result, 'last'))
  t.deepEqual(getQueries(result.last.href), {
    page: '3'
  })
})

test('has no prev/next HAL links if page is zero', (t) => {
  const options = { perPage: 1 }
  const result = pagination.getLinks('foo', 0, 3, 9, requestObj, aka, options, pluginOptions)

  t.truthy(_.has(result, 'first'))
  t.falsy(_.has(result, 'prev'))
  t.falsy(_.has(result, 'next'))
  t.truthy(_.has(result, 'last'))
})

test('has no prev/next HAL links if page is too high', (t) => {
  const options = { perPage: 1 }
  const result = pagination.getLinks('foo', 4, 3, 9, requestObj, aka, options, pluginOptions)

  t.truthy(_.has(result, 'first'))
  t.falsy(_.has(result, 'prev'))
  t.falsy(_.has(result, 'next'))
  t.truthy(_.has(result, 'last'))
})

test('passes request.params to aka', (t) => {
  const options = { perPage: 1 }
  const result = pagination.getLinks('foo', 2, 1, 5, requestObj, aka, options, pluginOptions)

  t.truthy(_.has(result, 'first'))
  t.deepEqual(getParams(result.first.href), {
    id: '1'
  })
  t.truthy(_.has(result, 'prev'))
  t.deepEqual(getParams(result.prev.href), {
    id: '1'
  })
  t.truthy(_.has(result, 'next'))
  t.deepEqual(getParams(result.next.href), {
    id: '1'
  })
  t.truthy(_.has(result, 'last'))
  t.deepEqual(getParams(result.last.href), {
    id: '1'
  })
})
