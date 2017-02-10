const test = require('tape').test
const validate = require('../src/validate')

const paramNames = {
  perPage: 'per_page',
  page: 'page',
  total: 'total'
}

test('bissle/validate.options >> is valid', t => {
  const options = {
    key: 'foo',
    perPage: 42
  }

  t.equal(validate.options(options), true)
  t.end()
})

test('bissle/validate.options >> is valid | number-like string as per_page', t => {
  const options = {
    key: 'foo',
    perPage: '42'
  }

  t.equal(validate.options(options), true)
  t.end()
})

test('bissle/validate.options >> is valid | number as total', t => {
  const options = {
    key: 'foo',
    perPage: 42,
    total: 5
  }

  t.equal(validate.options(options), true)
  t.end()
})

test('bissle/validate.options >> is not valid | boolean as key', t => {
  const options = {
    key: false,
    perPage: 42
  }

  t.equal(validate.options(options), false)
  t.end()
})

test('bissle/validate.options >> is not valid | number as key', t => {
  const options = {
    key: 0,
    perPage: 42
  }

  t.equal(validate.options(options), false)
  t.end()
})

test('bissle/validate.options >> is not valid | boolean as per_page', t => {
  const options = {
    key: 'foo',
    perPage: false
  }

  t.equal(validate.options(options), false)
  t.end()
})

test('bissle/validate.options >> is not valid | string as per_page', t => {
  const options = {
    key: 'foo',
    perPage: 'foo'
  }

  t.equal(validate.options(options), false)
  t.end()
})

test('bissle/validate.options >> is not valid | string as total', t => {
  const options = {
    key: 'foo',
    perPage: 42,
    total: 'foo'
  }

  t.equal(validate.options(options), false)
  t.end()
})

test('bissle/validate.options >> is not valid | negative number as total', t => {
  const options = {
    key: 'foo',
    perPage: 42,
    total: -1
  }

  t.equal(validate.options(options), false)
  t.end()
})

test('bissle/validate.options >> is not valid | number-like string as total', t => {
  const options = {
    key: 'foo',
    perPage: 42,
    total: '5'
  }

  t.equal(validate.options(options), false)
  t.end()
})

test('bissle/validate.query >> is valid | default values', t => {
  const options = {
    perPage: 42
  }

  const query = {}

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 1)
  t.equal(query.per_page, 42)
  t.end()
})

test('bissle/validate.query >> is valid | default values with custom param names', t => {
  const options = {
    perPage: 42
  }

  const customParamNames = {
    perPage: 'pageSize',
    page: 'currentPage',
    total: 'totalCount'
  }

  const query = {}

  t.equal(validate.query(query, options, customParamNames), true)

  t.equal(query.currentPage, 1)
  t.equal(query.pageSize, 42)
  t.end()
})

test('bissle/validate.query >> is valid | custom values', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 2,
    per_page: 100
  }

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 2)
  t.equal(query.per_page, 100)
  t.end()
})

test('bissle/validate.query >> is valid | custom values with custom param names', t => {
  const options = {
    perPage: 42
  }

  const query = {
    currentPage: 2,
    pageSize: 100
  }

  const customParamNames = {
    perPage: 'pageSize',
    page: 'currentPage',
    total: 'totalCount'
  }

  t.equal(validate.query(query, options, customParamNames), true)
  t.equal(query.currentPage, 2)
  t.equal(query.pageSize, 100)
  t.end()
})

test('bissle/validate.query >> is valid | edge minimum cases', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 1
  }

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 1)
  t.equal(query.per_page, 1)
  t.end()
})

test('bissle/validate.query >> is valid | edge maximum cases', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 500
  }

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 1)
  t.equal(query.per_page, 500)
  t.end()
})

test('bissle/validate.query >> is valid | number-like strings', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: '1',
    per_page: '1'
  }

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 1)
  t.equal(query.per_page, 1)
  t.end()
})

test('bissle/validate.query >> is valid | page converted to default', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 0,
    per_page: 1
  }

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 1)
  t.equal(query.per_page, 1)
  t.end()
})

test('bissle/validate.query >> is valid | per_page converted to default', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 0
  }

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 1)
  t.equal(query.per_page, 42)
  t.end()
})

test('bissle/validate.query >> is not valid | page is negative', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: -1,
    per_page: 1
  }

  t.equal(validate.query(query, options, paramNames), false)
  t.equal(query.page, -1)
  t.equal(query.per_page, 1)
  t.end()
})

test('bissle/validate.query >> is valid | page is boolean', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: false,
    per_page: 1
  }

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 1)
  t.equal(query.per_page, 1)
  t.end()
})

test('bissle/validate.query >> is valid | per_page is boolean', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: false
  }

  t.equal(validate.query(query, options, paramNames), true)
  t.equal(query.page, 1)
  t.equal(query.per_page, 42)
  t.end()
})

test('bissle/validate.query >> is not valid | page is string', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 'foo',
    per_page: 1
  }

  t.equal(validate.query(query, options, paramNames), false)
  t.equal(query.page, 0)
  t.equal(query.per_page, 1)
  t.end()
})

test('bissle/validate.query >> is not valid | per_page is string', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 'foo'
  }

  t.equal(validate.query(query, options, paramNames), false)
  t.equal(query.page, 1)
  t.equal(query.per_page, 0)
  t.end()
})

test('bissle/validate.query >> is not valid | per_page out of range', t => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 1000
  }

  t.equal(validate.query(query, options, paramNames), false)
  t.equal(query.page, 1)
  t.equal(query.per_page, 1000)
  t.end()
})
