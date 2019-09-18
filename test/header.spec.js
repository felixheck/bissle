const test = require('ava')
const _ = require('lodash')
const header = require('../src/header')

test('do not parse link header', (t) => {
  const links = {}

  t.is(header.getLink(links), undefined)
})

test('parse the related link header', (t) => {
  const links = {
    prev: { href: 'foo' },
    last: { href: 'bar' }
  }

  const splitLinks = _.map(header.getLink(links).split(','), _.trim)
  const matchedEntities = header.getLink(links).match(/<.*?>/g)
  const result = _.every(splitLinks, splitLink => splitLink.match(/<.*>; rel=".*"/))

  t.is(splitLinks.length, 2)
  t.deepEqual(matchedEntities, ['<foo>', '<bar>'])
  t.truthy(result)
})
