'use strict';

var methods = require('methods');
var querystring = require('querystring');
var routeCollection = {};
var allRoutes = {};

var proto = module.exports = function (express, options) {
    function router() {
    }

    router.__proto__ = proto;
    router.domain = ((options || {}).domain || '').replace(/\/*$/, '');
    router.groups = [];
    router.expressRouter = express.Router(options || {});
    //console.log(routeCollection);
    console.log(allRoutes);
    return router;
};

proto.NUMBER = /\d+/;
proto.ALPHA = /[a-zA-Z]+/;
proto.ALPHA_NUMBER = /[a-zA-Z0-9]+/;
proto.ALPHA_NUMBER_DASH = /[a-zA-Z0-9_]+/;
proto.SLUG = /[a-zA-Z0-9\-]+/;
proto.SLUG_PLUS = /[a-zA-Z0-9_\-\+]+/;

// HTTP methods
methods.concat('all').forEach(function (method) {
    method = method.toLowerCase();
    proto[method] = function (pattern, handler, options) {
        options = options || {};
        this._addRoute({
            method: method,
            pattern: pattern,
            handler: handler,
            name: options.name || null,
            conditions: options.where || {},
            grouped: '',
            compiled: null
        });
    };
});
// express methods
['param', 'route', 'use'].forEach(function (method) {
    proto[method] = function () {
        this.expressRouter.apply(this.expressRouter, arguments);
    };
});

proto.urlFor = proto.link = function (name, params, query, absolute) {
    if (typeof routeCollection[name] == 'undefined') {
        throw new Error('Route "' + name + '"" is not defined.');
    }
    var match, replacement,
        route = routeCollection[name],
        link = route.pattern;

    params = params || {};
    while (match = /:([\w_]+)\??/ig.exec(link)) {
        replacement = params[match[1]] || '';
        if (replacement === '') {
            link = link.replace('/' + match[0], '');
        } else {
            link = link.replace(match[0], replacement);
        }
    }
    if (typeof query == 'object' && query !== null) {
        link += '?' + querystring.stringify(query);
    } else if (typeof query == 'string') {
        link += '?' + query;
    }

    return (absolute ? route.domain : '') + link;
};

proto.group = function (path, callback) {
    this.groups.push(path.replace(/^\/|\/$/g, ''));
    callback.call();
    this.groups.shift();
};

proto._addRoute = function (route) {
    route.pattern = (this.groups.length ? '/' + this.groups.join('/') : '') + route.pattern;
    route.compiled = compilePattern(route.pattern, route.conditions || {});
    route.domain = this.domain;

    this.expressRouter[route.method](route.compiled, route.handler);
    routeCollection[route.name] = route;
    allRoutes[route.name] = {
        name: route.name,
        pattern: route.pattern
    }
};

function compilePattern(pattern, conditions) {
    var re = /(\/)?(:([\w_]+))(\?)?/ig,
        match, compiled = pattern;

    while (match = re.exec(pattern)) {
        compiled = compiled.replace(match[0], compileParam(conditions, match));
    }
    return compiled;
}

function compileParam(conditions, match) {
    var original = match[0],
        slash = match[1],
        pattern = match[2],
        name = match[3],
        optional = match[4],
        cond = conditions[name] || false;

    if (!cond) {
        return original;
    } else if (Array.isArray(cond)) {
        cond = cond.join('|');
    } else if (typeof cond == 'object') {
        cond = cond.toString().replace(/^\/|\/(\w+)?$/g, '');
    } else if (typeof cond == 'string') {
        cond = cond.trim();
    }
    cond = pattern + '(' + cond + ')';
    if (optional) {
        cond = (slash ? slash + '?' : '') + '(' + cond + ')?';
    } else {
        cond = slash + cond;
    }
    return cond;
}

module.exports.urFor = proto.urlFor;
module.exports.allRoutes = allRoutes;
