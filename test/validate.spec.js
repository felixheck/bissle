const test = require('ava')
const validate = require('../src/validate')

const paramNames = {
  perPage: 'per_page',
  page: 'page',
  total: 'total'
}

test('options are valid', (t) => {
  const specs = [
    {
      key: 'foo',
      perPage: 42
    },
    // number-like string as per_page
    {
      key: 'foo',
      perPage: '42'
    },
    // number as total
    {
      key: 'foo',
      perPage: 42,
      total: 5
    }
  ]

  t.plan(specs.length)

  specs.forEach(spec => {
    t.truthy(validate.options(spec))
  })
})

test('options are not valid', (t) => {
  const specs = [
    // boolean as key
    {
      key: false,
      perPage: 42
    },
    // number as key
    {
      key: 0,
      perPage: 42
    },
    // boolean as per_page
    {
      key: 'foo',
      perPage: false
    },
    // string as per_page
    {
      key: 'foo',
      perPage: 'foo'
    },
    // string as total
    {
      key: 'foo',
      perPage: 42,
      total: 'foo'
    },
    // negative number as total
    {
      key: 'foo',
      perPage: 42,
      total: -1
    },
    // number-like string as total
    {
      key: 'foo',
      perPage: 42,
      total: '5'
    }
  ]

  t.plan(specs.length)

  specs.forEach(spec => {
    t.falsy(validate.options(spec))
  })
})

test('query is valid | default values', (t) => {
  const options = {
    perPage: 42
  }

  const query = {}

  t.truthy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 42)
})

test('query is valid | default values with custom param names', (t) => {
  const options = {
    perPage: 42
  }

  const customParamNames = {
    perPage: 'pageSize',
    page: 'currentPage',
    total: 'totalCount'
  }

  const query = {}

  t.truthy(validate.query(query, options, customParamNames))
  t.is(query.currentPage, 1)
  t.is(query.pageSize, 42)
})

test('query is valid | custom values', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 2,
    per_page: 100
  }

  t.truthy(validate.query(query, options, paramNames), true)
  t.is(query.page, 2)
  t.is(query.per_page, 100)
})

test('query is valid | custom values with custom param names', (t) => {
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

  t.truthy(validate.query(query, options, customParamNames))
  t.is(query.currentPage, 2)
  t.is(query.pageSize, 100)
})

test('query is valid | edge minimum cases', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 1
  }

  t.truthy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 1)
})

test('query is valid | edge maximum cases', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 500
  }

  t.truthy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 500)
})

test('query is valid | number-like strings', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: '1',
    per_page: '1'
  }

  t.truthy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 1)
})

test('query is valid | page converted to default', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 0,
    per_page: 1
  }

  t.truthy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 1)
})

test('query is valid | per_page converted to default', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 0
  }

  t.truthy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 42)
})

test('query is not valid | page is negative', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: -1,
    per_page: 1
  }

  t.falsy(validate.query(query, options, paramNames))
  t.is(query.page, -1)
  t.is(query.per_page, 1)
})

test('query is valid | page is boolean', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: false,
    per_page: 1
  }

  t.truthy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 1)
})

test('query is valid | per_page is boolean', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: false
  }

  t.truthy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 42)
})

test('query is not valid | page is string', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 'foo',
    per_page: 1
  }

  t.falsy(validate.query(query, options, paramNames))
  t.is(query.page, 0)
  t.is(query.per_page, 1)
})

test('query is not valid | per_page is string', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 'foo'
  }

  t.falsy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 0)
})

test('query is not valid | per_page out of range', (t) => {
  const options = {
    perPage: 42
  }

  const query = {
    page: 1,
    per_page: 1000
  }

  t.falsy(validate.query(query, options, paramNames))
  t.is(query.page, 1)
  t.is(query.per_page, 1000)
})
