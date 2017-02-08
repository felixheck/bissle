# bissle
#### Minimalist HALicious pagination reply interface for [HapiJS](https://github.com/hapijs/hapi)

[![Travis](https://img.shields.io/travis/felixheck/bissle.svg)](https://travis-ci.org/felixheck/bissle/builds/) ![npm](https://img.shields.io/npm/dt/bissle.svg)

---

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API](#api)
5. [Example](#example)
6. [Testing](#testing)
7. [Contribution](#contribution)
8. [License](#license)

## Introduction

This [HapiJS](https://github.com/hapijs/hapi) plugin enables an additional reply interface to paginate a response in a RESTful and [HAL](https://tools.ietf.org/html/draft-kelly-json-hal-06) compliant manner. So the plugin accordingly splices the initial response; extends it with meta information about the count of entries per page, the total count and the current page; adds a link map for HALicious navigation and appends the corresponding `Link` header. It is not a middleware-like plugin, so you are allowed to control the usage explicitly by yourself. Because of this, it works perfectly in combination with HAL plugins like [halacious](https://github.com/bleupen/halacious), as it is shown in the [example](#example) below.

The plugin is implemented in ECMAScript 6, therefore the development dependencies are based on `babel`. Additionally `eslint` and `tape` are used to grant a high quality implementation.

**bissle** is the Swabian term for *a little bit*, it should visualize the sense of pagination.

## Installation
For installation use the [Node Package Manager](https://github.com/npm/npm):
```
// production version with ES5 syntax
$ npm install --save bissle
```

or clone the repository:
```
// development version with ES6 syntax
$ git clone https://github.com/felixheck/bissle
```

Alternatively use the [Yarn Package Manager](https://yarnpkg.com):
```
// production version with ES5 syntax
$ yarn add bissle
```

## Usage
#### Import
First you have to import the module and the peer dependency [akaya](https://github.com/felixheck/akaya):
``` js
const bissle = require('bissle');
const akaya = require('akaya');
```

#### Create HapiJS server
Afterwards create your **HapiJS** server and the corresponding connection if not already done:
``` js
const server = new Hapi.Server();

server.connection({
  port: 1337,
  host: 'localhost',
});
```

#### Registration
Finally register the plugins per `server.register()`:
``` js
server.register([akaya, bissle], err => {
  if (err) {
    throw err;
  }

  server.start();
});
```

After registering **bissle**, the [HapiJS reply interface](http://hapijs.com/api#reply-interface) will be decorated with the new method `reply.bissle()`.

#### Joi Validation
If you use **Joi** for request validation, simply add `per_page` and `page` to the query scheme. The plugin exposes the all *bissle* related scheme via `server.plugins.bissle.scheme`. Alternatively it is possible to enable the `allowUnknown` option.<br>The exposed object contains additionally the scheme for plugin related options.

## API
#### Plugin Options
While the plugin registration it is possible to pass a [plugin specific options object](http://hapijs.com/api#serverregisterplugins-options-callback):
- `options {Object}` - The plugin specific options object.
  - `absolute {boolean}` - If the pagination links (not the `Link` header) should be absolute or not.<br>Default: `false`.
  - `paramNames {Object}` - Config object for overriding default parameter names output in the response
    - `per_page {string}` - Parameter name for describing the page size <br>Default: `per_page`
    - `page {string}` - Parameter name for describing the current page <br>Default: `page`
    - `total {string}` - Parameter name for describing the total item count <br>Default: `total`

#### `reply.bissle(response, [options])`

An additional reply interface for paginated responses.
- `response {Object}` - The result to be decorated and replied.
- `options {Object}` - The custom default values.
  - `key {string}` - The access key of `response` to get the result to be paginated.<br>Default: `'result'`.
  - `per_page {number}` - The default entries per page if none is defined in the query string.<br>Default: `100`.<br>Range: `1-500`.
  - `total {number}` - Overwrite the internally generated `total` value and avoid data splicing. The passed response get returned without internally done pagination. Just meta information and the `Link` header get added.<br>Default: `null`.<br>Range: `>=0`.

If you set a number to `options.total`, the
##Example
The following example demonstrates the usage of **bissle** in combination with **mongoose**, **halacious** and various utilities.

```js
const Hapi = require('hapi');
const bissle = require('bissle');
const halacious = require('halacious');
const akaya = require('akaya');
const Boom = require('boom');
const _ = require('lodash');
const YourModel = require('./models/yourModel');

const server = new Hapi.Server();
server.connection({ port: 1337 });

server.route({
  method: 'GET',
  path: '/',
  config: {
    id: 'root',
    handler: function (request, reply) {
      YourModel.find({}, (err, result) => {
        if (err) return reply(Boom.badRequest(err));
        if (!result) return reply(Boom.notFound());

        return reply.bissle({ result });
      });
    },
    plugins: {
      hal: {
        prepare: function(rep, next) {
          _.forEach(rep.entity.result, task => {
            rep.embed('task', `./${task._id}`, task);
          });

          return next();
        },
        ignore: ['result']
      }
    }
});

server.register([akaya, halacious, {
  register: bissle,
  options: { absolute: false }
}], err => {
  if (err) throw err;

  server.start();
});
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

## License
The MIT License

Copyright (c) 2016 Felix Heck

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
