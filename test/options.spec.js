const test = require('ava')
const _ = require('lodash')
const errors = require('../src/errors')
const { setup } = require('./_helpers')

test.only('adjust the default entries per page', async (t) => {
  const { server } = await setup({ perPage: 3 })
  const response = await server.inject('/')

  console.log(response.result);

  t.is(response.result.result.length, 3)
  t.is(response.result.total, 9)
  t.is(response.result.per_page, 3)
  t.is(response.result.page, 1)
  t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last', 'next'].sort())
})

test('adjust the default entries per page | 1000', t => {
  const { server } = setup({ perPage: 1000 })

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400)
    t.equal(response.result.message, errors.invalidOptions)
    t.end()
  })
})

test('adjust the default entries per page | 0', t => {
  const { server } = setup({ perPage: 0 })

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400)
    t.equal(response.result.message, errors.invalidOptions)
    t.end()
  })
})

test('adjust the total option', t => {
  const { server } = setup({ total: 5 })

  server.inject('/?page=2&per_page=2', response => {
    t.equal(response.result.result.length, 9)
    t.equal(response.result.total, 5)
    t.equal(response.result.per_page, 2)
    t.equal(response.result.page, 2)
    t.equal(response.result._links.last.href, '/?page=3&per_page=2')
    t.end()
  })
})

test('adjust the total option | -1', t => {
  const { server } = setup({ total: -1 })

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400)
    t.equal(response.result.message, errors.invalidOptions)
    t.end()
  })
})

test('adjust the total option | \'foo\'', t => {
  const { server } = setup({ total: 'foo' })

  server.inject('/?page=2&per_page=2', response => {
    t.equal(response.result.statusCode, 400)
    t.equal(response.result.message, errors.invalidOptions)
    t.end()
  })
})

test('adjust the default access key', t => {
  const { server } = setup({ key: 'foo' })

  server.inject('/', response => {
    t.equal(response.result.foo.length, 9)
    t.equal(response.result.total, 9)
    t.equal(response.result.per_page, 100)
    t.equal(response.result.page, 1)
    t.deepEqual(_.keys(response.result._links).sort(), ['self', 'first', 'last'].sort())
    t.end()
  })
})

test('adjust the default access key | 0', t => {
  const { server } = setup({ key: 0 })

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400)
    t.equal(response.result.message, errors.invalidOptions)
    t.end()
  })
})

test('adjust the default entries per page | undefined', t => {
  const { server } = setup({ key: undefined })

  server.inject('/', response => {
    t.equal(response.result.statusCode, 400)
    t.equal(response.result.message, errors.invalidOptions)
    t.end()
  })
})
