const test = require('ava')
const joi = require('@hapi/joi')
const _ = require('lodash')
const errors = require('../src/errors')
const { setup } = require('./_helpers')

test('return absolute links', async (t) => {
  const { host, server } = await setup({}, { absolute: true })
  const { result } = await server.inject('/')

  t.truthy(_.some(result._links, link => _.startsWith(link.href, host)))
})

test('return relative links', async (t) => {
  const { host, server } = await setup({}, { absolute: false })
  const { result } = await server.inject('/')

  t.falsy(_.some(result._links, link => _.startsWith(link.href, host)))
})

test('throw error if plugin specific options invalid', async (t) => {
  await t.throwsAsync(setup({}, { foo: true }), Error)
})

test('request without query parameters', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/')

  t.is(result.result.length, 9)
  t.is(result.total, 9)
  t.is(result.per_page, 100)
  t.is(result.page, 1)
  t.deepEqual(_.keys(result._links).sort(), ['self', 'first', 'last'].sort())
})

test('request without query parameters | custom param names', async (t) => {
  const { server } = await setup(null, {
    absolute: false,
    paramNames: {
      perPage: 'pageSize',
      page: 'currentPage',
      total: 'totalCount'
    }
  })

  const { result } = await server.inject('/')

  t.is(result.result.length, 9)
  t.is(result.totalCount, 9)
  t.is(result.pageSize, 100)
  t.is(result.currentPage, 1)
  t.deepEqual(_.keys(result._links).sort(), ['self', 'first', 'last'].sort())
})

test('request with custom "per_page" query parameter | first page', async (t) => {
  const { server } = await setup(null, {
    absolute: false,
    paramNames: {
      perPage: 'pageSize',
      page: 'currentPage',
      total: 'totalCount'
    }
  })

  const { result } = await server.inject('/?pageSize=3')

  t.is(result.result.length, 3)
  t.is(result.totalCount, 9)
  t.is(result.pageSize, 3)
  t.is(result.currentPage, 1)
  t.deepEqual(_.map(result.result, _.partial(_.get, _, '_id')), ['1', '2', '3'])
  t.deepEqual(_.keys(result._links).sort(), ['self', 'first', 'last', 'next'].sort())
})

test('request with "per_page" query parameter | first page', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/?per_page=3')

  t.is(result.result.length, 3)
  t.is(result.total, 9)
  t.is(result.per_page, 3)
  t.is(result.page, 1)
  t.deepEqual(_.map(result.result, _.partial(_.get, _, '_id')), ['1', '2', '3'])
  t.deepEqual(_.keys(result._links).sort(), ['self', 'first', 'last', 'next'].sort())
})

test('request with "page" query parameter | -1', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/?page=-1')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidQuery)
})

test('request with "per_page" query parameter | -1', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/?per_page=-1')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidQuery)
})

test('request with "per_page" query parameter | 1000', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/?per_page=1000')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidQuery)
})

test('request with both query parameters | last page', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/?page=3&per_page=3')

  t.is(result.result.length, 3)
  t.is(result.total, 9)
  t.is(result.per_page, 3)
  t.is(result.page, 3)
  t.deepEqual(_.map(result.result, _.partial(_.get, _, '_id')), ['7', '8', '9'])
  t.deepEqual(_.keys(result._links).sort(), ['self', 'first', 'last', 'prev'].sort())
})

test('request with both query parameters | not available', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/?page=4&per_page=3')

  t.is(result.result.length, 0)
  t.is(result.total, 9)
  t.is(result.per_page, 3)
  t.is(result.page, 4)
  t.deepEqual(_.keys(result._links).sort(), ['self', 'first', 'last'].sort())
})

test('route have no defined ID', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/page?page=4&per_page=3')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.missingId)
})

test('append all passed query parameters', async (t) => {
  const { server } = await setup()
  const { result } = await server.inject('/?page=4&per_page=3&fields=foo')

  t.is(result._links.self.href, '/?page=4&per_page=3&fields=foo')
  t.is(result._links.first.href, '/?per_page=3&fields=foo')
})

test('append all passed query parameters | custom param names', async (t) => {
  const { server } = await setup(null, {
    absolute: false,
    paramNames: {
      perPage: 'pageSize',
      page: 'currentPage',
      total: 'totalCount'
    }
  })

  const { result } = await server.inject('/?currentPage=4&pageSize=3&fields=foo')

  t.is(result._links.self.href, '/?currentPage=4&pageSize=3&fields=foo')
  t.is(result._links.first.href, '/?pageSize=3&fields=foo')
})

test('exposed query schema', async (t) => {
  const { server } = await setup()

  t.deepEqual(_.keys(server.plugins.bissle.scheme).sort(), ['page', 'per_page', 'pluginOptions'])
  t.truthy(joi.isSchema(server.plugins.bissle.scheme.page))
})

test('exposed query schema | custom param names', async (t) => {
  const { server } = await setup(null, {
    absolute: false,
    paramNames: {
      perPage: 'pageSize',
      page: 'currentPage',
      total: 'totalCount'
    }
  })

  t.deepEqual(_.keys(server.plugins.bissle.scheme).sort(), ['currentPage', 'pageSize', 'pluginOptions'])
  t.truthy(joi.isSchema(server.plugins.bissle.scheme.currentPage))
})
