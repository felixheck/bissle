const test = require('tape').test;
const _ = require('lodash');
const validate = require('../src/validate');
const errors = require('../src/errors');

test('bissle/validate.options >> is valid', t => {
  const options = {
    key: 'foo',
    per_page: 42,
  };

  t.equal(validate.options(options), true);
  t.end();
});

test('bissle/validate.options >> is valid | number-like string as per_page', t => {
  const options = {
    key: 'foo',
    per_page: '42',
  };

  t.equal(validate.options(options), true);
  t.end();
});

test('bissle/validate.options >> is not valid | boolean as key', t => {
  const options = {
    key: false,
    per_page: 42,
  };

  t.equal(validate.options(options), false);
  t.end();
});

test('bissle/validate.options >> is not valid | number as key', t => {
  const options = {
    key: 0,
    per_page: 42,
  };

  t.equal(validate.options(options), false);
  t.end();
});

test('bissle/validate.options >> is not valid | boolean as per_page', t => {
  const options = {
    key: 'foo',
    per_page: false,
  };

  t.equal(validate.options(options), false);
  t.end();
});

test('bissle/validate.options >> is not valid | string as per_page', t => {
  const options = {
    key: 'foo',
    per_page: 'foo',
  };

  t.equal(validate.options(options), false);
  t.end();
});
