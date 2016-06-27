const test = require('tape').test;
const _ = require('lodash');
const header = require('../src/header');

test('bissle/header >> parses no link header', t => {
  const links = {};

  t.equal(header.getLink(links), undefined);
  t.end();
});

test('bissle/header >> parses link header', t => {
  const links = {
    'prev': 'foo',
    'last': 'bar',
  };

  const splitLinks= _.map(header.getLink(links).split(','), _.trim);
  const matchedEntities = header.getLink(links).match(/<.*?>/g);
  const result = _.every(splitLinks, splitLink => splitLink.match(/<.*>; rel=".*"/));

  t.equal(splitLinks.length, 2);
  t.deepEqual(matchedEntities, ['<foo>', '<bar>']);
  t.equal(result, true);
  t.end();
});