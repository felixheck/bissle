# bissle
#### Minimal HALicious pagination reply interface for [HapiJS](https://github.com/hapijs/hapi)

[![Travis](https://img.shields.io/travis/felixheck/bissle.svg)](https://travis-ci.org/felixheck/bissle/builds/) ![npm](https://img.shields.io/npm/dt/doila.svg)

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

This [hapi](https://github.com/hapijs/hapi) plugin enanbles an additional reply interface to paginate a response in a RESTful and [HAL](https://tools.ietf.org/html/draft-kelly-json-hal-06) compliant manner. So the response accordingly splices the initial response; extends it with meta information about the count of entries per page, the total count and the current page; adds a link map for HALicious navigation and appends the fitting `Link` header. It is not a middleware-like plugin, so you could control the usage by yourself. Because of this it works perfectly in combination with HAL plugins like [halacious](https://github.com/bleupen/halacious).

The plugin is implemented in ECMAScript 6, therefore the development dependencies are based on `babel`. Additionally `eslint` and `tape` are used to grant a high quality implementation.

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

## Usage
#### Import
First you have to import the module:
``` js
const bissle = require('bissle');
```

#### Create hapi server
Afterwards create your hapi server and the corresponding connection if not already done:
``` js
const server = new Hapi.Server();

server.connection({
  port: 1337,
  host: 'localhost',
});
```

#### Registration
Finally register the plugin per `server.register()`:
``` js
server.register(bissle, err => {
  if (err) {
    throw err;
  }

  server.start();
});
```

After registering `bissle`, the [hapi reply interface](hapijs.com/api#reply-interface) will be decorated with the new method `reply.bissle()`.

## API
`reply.bissle(response, [options])`

Returns an URI to a route
- `response {Object}` - the result to be decorated and replied
- `options`
  - `key {string}` - The access key of `response` to get the result to be paginated. Default: `result`.
  - `per_page {number}` - The default entries per page if none is defined in the query string. Default: `100` and maximum: `500`.
  - `page {number}` - The default page if none is defined in the query string. Default: `1`.

##Example

```js
const Hapi = require('hapi');
const bissle = require('bissle');
const halacious = require('halacious');
const Boom = require('boom');
const url = require('url');
const _ = require('lodash');
const YourModel = require('./models/yourModel');

const server = new Hapi.Server();
server.connection({ port: 1337 });

server.route({
  method: 'GET',
  path: '/',
  config: {
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

          _.forOwn(rep.entity.links, (href, entity) => {
            rep.link(entity, url.parse(href).path);
          });

          return next();
        },
        ignore: ['result', 'links']
      }
    }
});

server.register([bissle, halacious], err => {
  if (err) {
     throw err;
  }

  server.start();
});
```

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
