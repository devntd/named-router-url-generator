# Expressjs Named Router & URL Generator

A lightweight express-js router wrapper with additional named router and URL generator.

If you're looking for **Expressjs Named Router** and **URL Generator**, here's your

**Note:** This is a wrapper - not a replacement

## Features
* All features of express router (http://expressjs.com/4x/api.html#router)
* Naming router
* URL generation
* Router param matching conditional
* Nested group (replace to router mouting by using app.use('/path', router))
* Simple, easy to use, just need to change **2 lines of code** to get this.
* Easy to switch back to express router (if you don't like)

## Installation
```
npm install named-router-url-generator --save
```

## Requirements
* Epxressjs 4.x

## Usage
This is how you use express route (default)
```javascript
var express = require('express');
var router = express.Router();
// var router = express.Router([options]); // with options

// router.get() or any methods that express router supports
router.get('/users/:id/:name', function(req, res, next) {
    res.send('user id is ' + req.params.id + ' and name is ' + req.params.name);
});

module.exports = router;
```

Just need to change 2 lines to use this module.

### Naming Route (optional)

```javascript
var express = require('express');
var router = require('named-router-url-generator')(express); // you need to change this line (1)
// var router = require('express-named-router-url-generator')(express[, options]); // with options

// router.get() or any methods that express router supports
router.get('/users/:id/:name', function(req, res, next) {
    res.send('user id is ' + req.params.id + ' and name is ' + req.params.name);
}
// this is optional argument
, { name: 'router.name' }
);

module.exports = router.expressRouter; // you need to change this line (2)
```

### Route Matching with conditions (optional)
```javascript
router.put('/users/:id/:name', function(req, res, next) {
    res.send('user id is ' + req.params.id + ' and name is ' + req.params.name);
}, {
    // optional naming
    name: 'router.name',
    // optional condition
    where: {
        id: router.NUMBER,
        name: router.ALPHA
    }
});
```

This module ships with some rules to use quickly.

```javascript
proto.NUMBER = /\d+/;
proto.ALPHA = /[a-zA-Z]+/;
proto.ALPHA_NUMBER = /[a-zA-Z0-9]+/;
proto.ALPHA_NUMBER_DASH = /[a-zA-Z0-9_]+/;
proto.SLUG = /[a-zA-Z0-9\-]+/;
proto.SLUG_PLUS = /[a-zA-Z0-9_\-\+]+/;
```

Of course, you also can define your rules by using regex, array, or string

```javascript
router.get('/:param1/:param2/:param3/:param4?', function(req, res, next) {
    res.send('hello word');
}, {
    name: 'route.name',
    where: {
        param1: /\d+/, // using regex
        param2: ['hello', 'world'], // match "hello" or "world"
        param3: 'fixed-string' // must equal to "fixed-string"
    }
});
```

### URL Generation

Once you have defined your routes (and loaded the routes), to genrate URL, you can use `router.urlFor` method of router instance or `urlFor` helper provided by this module.

Both way are same and can use in any controllers.

#### router.urlFor

`router.urlFor(name [, params [, query [, absolute]]]);`

```javascript
var link = router.urlFor('route.name', {id: '123456', name: 'this-is-a-name'});
console.log(link);

// with query string
router.urlFor('route.name', {id: '123456', name: 'this-is-a-name'}, 'a=b&c=d');
// or
router.urlFor('route.name', {id: '123456', name: 'this-is-a-name'}, {a: 'b', c: 'd'});
```

#### urlFor helper

```javascript
var urlFor = require('express-named-router-url-generator').urlFor;

var link = urlFor('route.name', {id: '123456', name: 'this-is-a-name'});
console.log(link);

// with query string
urlFor('route.name', {id: '123456', name: 'this-is-a-name'}, 'a=b&c=d');
// or
urlFor('route.name', {id: '123456', name: 'this-is-a-name'}, {a: 'b', c: 'd'});

```

By default, all generated urls are relative. If you want to generate absolute URL, you need to use `domain` options.

```javascript
var express = require('express');
var router = require('express-named-router-url-generator')(express, { domain: 'http://yourdomain.com' });
...

// param and query may be null.
router.link('route.name', null, null, true);

```

**Note:** If you mount a router to a path with app.use('/path/', router);
URL generator will not know that so it will generate URLs that does not include this path.
To define multiple routes inside a path as prefix, this module provide new method `router.group()`

### Nested Route Group
This is helpful method to group multiple routes to a path (a replacement for mouting router by app.use('/path/', router))

```javascript
router.group('/group1', function() {
    router.get('/path1', function(req, res, next) {
        res.send('you are in "/group1/path1"');
    });
    router.get('/path2', function(req, res, next) {
        res.send('you are in "' + router.link('route2') + '"'); // /group1/path2
    }, {
        name: 'route2'
    });
    router.group('/group2', function() {
        router.get('/path1', function(req, res, next) {
            res.send('you are in "' + router.link('route3') + '"'); // /group1/group2/path1
        }, {
            name: 'route3'
        });
    });
});
```
