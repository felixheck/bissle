# bissle
#### Minimalist HALicious pagination reply interface for [hapi.js](https://github.com/hapijs/hapi)

[![Travis](https://img.shields.io/travis/felixheck/bissle.svg)](https://travis-ci.org/felixheck/bissle/builds/) ![node](https://img.shields.io/node/v/bissle.svg) ![npm](https://img.shields.io/npm/dt/bissle.svg) [![standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/) ![npm](https://img.shields.io/npm/l/bissle.svg)
---

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API](#api)
5. [Example](#example)
6. [Testing](#testing)
7. [Contribution](#contribution)

## Introduction

This [hapi.js](https://github.com/hapijs/hapi) plugin enables an additional reply interface to paginate a response in a RESTful and [HAL](https://tools.ietf.org/html/draft-kelly-json-hal-06) compliant manner. So the plugin accordingly splices the initial response; extends it with meta information about the count of entries per page, the total count and the current page; adds a link map for HALicious navigation and appends the corresponding `Link` header. It is not a middleware-like plugin, so you are allowed to control the usage explicitly by yourself. Because of this, it works perfectly in combination with HAL plugins like [halacious](https://github.com/bleupen/halacious), as it is shown in the [example](#example) below.

The modules [`standard`](https://standardjs.com/) and [`ava`](https://github.com/avajs) are used to grant a high quality implementation.<br/>
This major release supports just [hapi.js](https://github.com/hapijs/hapi) `>=v17.0.0` and node `>=v8.0.0` — to support older versions please use `v1.2.4`.

#### Compatibility
| Major Release | [hapi.js](https://github.com/hapijs/hapi) version | node version |
| --- | --- | --- |
| `v3` | `>=18` | `>=10` |
| `v2` | `>=17` | `>=8` |
| `v1` | `>=13` | `>=6` |

**bissle** is the Swabian term for *a little bit*, it should visualize the sense of pagination.

## Installation
For installation use the [Node Package Manager](https://github.com/npm/npm):
```
$ npm install --save bissle
```

or clone the repository:
```
$ git clone https://github.com/felixheck/bissle
```

## Usage
#### Import
First you have to import the module and the peer dependency [akaya](https://github.com/felixheck/akaya):
``` js
const bissle = require('bissle');
const akaya = require('akaya');
```

#### Create Hapi server
Afterwards create your **Hapi.js** server if not already done:
``` js
const hapi = require('hapi');
const server = hapi.server({
  port: 1337,
  host: 'localhost',
});
```

#### Registration
Finally register the plugins per `server.register()`:
``` js
await server.register([akaya, bissle]);
await server.start();
```

After registering **bissle**, the [hapi.js response toolkit](http://hapijs.com/api##response-toolkit) will be decorated with the new method `h.bissle()`.

#### Joi Validation
If you use **Joi** for request validation, simply add the parameters to the query scheme. The plugin exposes the all *bissle* related scheme via `server.plugins.bissle.scheme`. Alternatively it is possible to enable the `allowUnknown` option.<br>The exposed object contains additionally the scheme for plugin related options.

## API
#### Plugin Options
While the plugin registration it is possible to pass a [plugin specific options object](http://hapijs.com/api#serverregisterplugins-options-callback):
- `options {Object}` - The plugin specific options object.
  - `absolute {boolean}` - If the pagination links (not the `Link` header) should be absolute or not.<br>Default: `false`.
  - `paramNames {Object}` - Config object for overriding default parameter names output in the response
    - `perPage {string}` - Parameter name for describing the page limit <br>Default: `per_page`
    - `page {string}` - Parameter name for describing the current page <br>Default: `page`
    - `total {string}` - Parameter name for describing the total item count <br>Default: `total`

#### `reply.bissle(response, [options])`

An additional response toolkit for paginated responses.
- `response {Object}` - The result to be decorated and replied.
- `options {Object}` - The custom default values.
  - `key {string}` - The access key of `response` to get the result to be paginated.<br>Default: `'result'`.
  - `perPage {number}` - The default entries per page if none is defined in the query string.<br>Default: `100`.<br>Range: `1-500`.
  - `total {number}` - Overwrite the internally generated `total` value and avoid data splicing. The passed response get returned without internally done pagination. Just meta information and the `Link` header get added.<br>Default: `null`.<br>Range: `>=0`.

## Example
The following example demonstrates the usage of **bissle** in combination with **mongoose**, **halacious** and various utilities.

```js
const hapi = require('hapi');
const bissle = require('bissle');
const halacious = require('halacious');
const akaya = require('akaya');
const Boom = require('boom');
const _ = require('lodash');
const YourModel = require('./models/yourModel');

const server = hapi.server({ port: 1337 });

server.route({
  method: 'GET',
  path: '/',
  config: {
    id: 'root',
    handler (request, h) {
      YourModel.find({}, (err, result) => {
        if (err) throw Boom.badRequest(err);
        if (!result) throw Boom.notFound();

        return h.bissle({ result });
      });
    },
    plugins: {
      hal: {
        prepare(rep) {
          _.forEach(rep.entity.result, task => {
            rep.embed('task', `./${task._id}`, task);
          });
        },
        ignore: ['result']
      }
    }
});

(async () => {
  try {
    await server.register([akaya, halacious, {
      register: bissle,
      options: { absolute: false }
    }]);
    await server.start();
    console.log('Server started successfully');
  } catch (err) {
    console.error(err);
  }
})();
```

---

Assuming that **mongoose**'s `find()` returns the following data as `result`:

```js
[
  {
    _id: "abc",
    title: "abc"
  },
  {
    _id: "def",
    title: "def"
  },
  {
    _id: "ghi",
    title: "ghi"
  },
  {
    _id: "jkl",
    title: "jkl"
  },
  {
    _id: "mno",
    title: "mno"
  }
]
```

---

Requesting the route `/items?page=2&per_page=2`, the plugin replies:

```js
{
  _links: {
    self: {
      href: "/items?page=2&per_page=2"
    },
    first: {
      href: "/items?per_page=2"
    },
    prev: {
      href: "/items?per_page=2"
    },
    next: {
      href: "/items?page=3&per_page=2"
    },
    last: {
      href: "/items?page=3&per_page=2"
    },
  },
  page: 2,
  per_page: 2,
  total: 5,
  result: [
    {
      _id: "ghi",
      title: "ghi"
    },
    {
      _id: "jkl",
      title: "jkl"
    }
  ]
}

```

Additionally the plugin sets the corresponding `Link` header.

---

The **halacious** plugin enables to extend this response to:

```js
{
  _links: {
    self: {
      href: "/items?page=2&per_page=2"
    },
    first: {
      href: "/items?per_page=2"
    },
    prev: {
      href: "/items?per_page=2"
    },
    next: {
      href: "/items?page=3&per_page=2"
    },
    last: {
      href: "/items?page=3&per_page=2"
    },
  },
  page: 2,
  per_page: 2,
  total: 5,
  _embedded: [
    {
      _links: {
        self: {
          href: "/items/ghi"
        }
      },
      _id: "ghi",
      title: "ghi"
    },
    {
      _links: {
        self: {
          href: "/items/jkl"
        }
      },
      _id: "jkl",
      title: "jkl"
    }
  ]
}

```

So in the end the combination of **bissle** and a HAL plugin results in a REST/HAL compliant and paginated response.

## Testing
First you have to install all dependencies:
```
$ npm install
```

To execute all unit tests once, use:
```
$ npm test
```

or to run tests based on file watcher, use:
```
$ npm start
```

To get information about the test coverage, use:
```
$ npm run coverage
```

## Contribution
Fork this repository and push in your ideas.

Do not forget to add corresponding tests to keep up 100% test coverage.
