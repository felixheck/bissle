const test = require('ava')
const _ = require('lodash')
const errors = require('../src/errors')
const { setup } = require('./_helpers')

test('adjust the default entries per page', async (t) => {
  const { server } = await setup({ perPage: 3 })
  const { result } = await server.inject('/')

  t.is(result.result.length, 3)
  t.is(result.total, 9)
  t.is(result.per_page, 3)
  t.is(result.page, 1)
  t.deepEqual(_.keys(result._links).sort(), ['self', 'first', 'last', 'next'].sort())
})

test('adjust the default entries per page | 1000', async (t) => {
  const { server } = await setup({ perPage: 1000 })
  const { result } = await server.inject('/')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidOptions)
})

test('adjust the default entries per page | 0', async (t) => {
  const { server } = await setup({ perPage: 0 })
  const { result } = await server.inject('/')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidOptions)
})

test('adjust the total option', async (t) => {
  const { server } = await setup({ total: 5 })
  const { result } = await server.inject('/?page=2&per_page=2')

  t.is(result.result.length, 9)
  t.is(result.total, 5)
  t.is(result.per_page, 2)
  t.is(result.page, 2)
  t.is(result._links.last.href, '/?page=3&per_page=2')
})

test('adjust the total option | -1', async (t) => {
  const { server } = await setup({ total: -1 })
  const { result } = await server.inject('/')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidOptions)
})

test('adjust the total option | \'foo\'', async (t) => {
  const { server } = await setup({ total: 'foo' })
  const { result } = await server.inject('/?page=2&per_page=2')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidOptions)
})

test('adjust the default access key', async (t) => {
  const { server } = await setup({ key: 'foo' })
  const { result } = await server.inject('/')

  t.is(result.foo.length, 9)
  t.is(result.total, 9)
  t.is(result.per_page, 100)
  t.is(result.page, 1)
  t.deepEqual(_.keys(result._links).sort(), ['self', 'first', 'last'].sort())
})

test('adjust the default access key | 0', async (t) => {
  const { server } = await setup({ key: 0 })
  const { result } = await server.inject('/')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidOptions)
})

test('adjust the default entries per page | undefined', async (t) => {
  const { server } = await setup({ key: undefined })
  const { result } = await server.inject('/')

  t.is(result.statusCode, 400)
  t.is(result.message, errors.invalidOptions)
})
