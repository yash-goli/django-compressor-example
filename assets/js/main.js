(function(window,document,undefined){
	
var mi = (function () {
    'use strict';
    var resources = {
        'filters' : { },
        'constants' : { },
        'factory' : { },
        '$me' : {
            'key' : 'val'
        },
        'mode' : null,
        'root' : '/',
        'routes' : { },
        'controller' : { },
        'config': function(options) {
            resources.mode = options && options.mode && options.mode == 'history' 
                        && !!(history.pushState) ? 'history' : 'hash';
            resources.root = options && options.root ? '/' + resources.clearSlashes(options.root) + '/' : '/';
            // return resources;
        },
        'getFragment': function() {
            var fragment = '';
            if(resources.mode === 'history') {
                fragment = resources.clearSlashes(decodeURI(location.pathname + location.search));
                fragment = fragment.replace(/\?(.*)$/, '');
                fragment = resources.root != '/' ? fragment.replace(resources.root, '') : fragment;
            } else {
                var match = window.location.href.match(/#(.*)$/);
                fragment = match ? match[1] : '';
            }
            return resources.clearSlashes(fragment);
        },
        'clearSlashes': function(path) {
            return path.toString().replace(/\/$/, '').replace(/^\//, '');
        },
        'check': function (hash) {
            var reg, keys, match, routeParams;
            for (var i = 0, max = resources.routes.length; i < max; i++ ) {
                routeParams = {}
                keys = resources.routes[i].path.match(/:([^\/]+)/g);
                match = hash.match(new RegExp(resources.routes[i].path.replace(/:([^\/]+)/g, "([^\/]*)")));
                if (match) {
                    match.shift();
                    match.forEach(function (value, i) {
                        routeParams[keys[i].replace(":", "")] = value;
                    });
                    //load dependency and call
                    resources.controller[resources.routes[i].handler].call({}, routeParams);
                }
            }
        },
        
        'listen': function() {
            var current = resources.getFragment();
            var fn = function() {
                if(current !== resources.getFragment()) {
                    current = resources.getFragment();
                    resources.check(current);
                }
            }
            clearInterval(this.interval);
            this.interval = setInterval(fn, 50);
        },
    }, api = {
        'filters': function (key, val) {
            resources.filters[key] = val;
        },
        'factory': function (key, arrayArg) {
            var last_index = arrayArg.length-1;
            var dependancies = api.loadDependancies(arrayArg.slice(0, -1));
            console.log('last_index'+last_index);
            console.log(dependancies);
            if (typeof arrayArg[last_index] === "function") {
                resources.factory[last_index] = arrayArg[last_index].apply(this, dependancies);
            } else {
                console.log("Nan");
            }
        },

        'routes' :  function(route, controller){
            resources.routes['path'] = route;
            resources.routes['handler'] = controller;
        },

        'controller' : function(controller, handler){

        },

        'loadDependancies' : function(arrayArg){
            var dependancy = [], iter;
            for (iter = 0; iter < arrayArg.length; iter += 1) {
                if (typeof arrayArg[iter] === "string") {
                    //look in factory
                    if (resources.factory.hasOwnProperty(arrayArg[iter])) {
                        dependancy.push(api.loadDependancy(arrayArg[iter]));
                    } else {
                        //look in constants
                        if (resources.constants.hasOwnProperty(arrayArg[iter])) {
                            dependancy.push(api.loadConstant(arrayArg[iter]));
                        } else {
                            //if it is $me scope
                            if (arrayArg[iter] === "$me") {
                                dependancy.push({});
                            } else {
                                console.log("Error: " + arrayArg[iter] + " is not Found in constants and Factories");
                            }
                        }
                    }
                } 
            }
            return dependancy;
        },
        
        'loadDependancy': function (key) {
            return resources.factory[key];
        },

        'loadConstant': function (key) {
            return resources.constants[key];
        },

        'constants': function (key, val) {
            resources.constants[key] = val(); 
        }
    };

    function filters() {
        api.filters(arguments[0], arguments[1]);
    }

    function factory() {
        api.factory(arguments[0], arguments[1]);
    }

    function constants() {
        api.constants(arguments[0], arguments[1]);
    }

    function routes(){
        api.routes(arguments[0], arguments[1]);
    }

    function controller(){
        api.controller(arguments[0], arguments[1]);
    }

    return {
        'filters': filters,
        'factory': factory,
        'routes': routes,
        'controller': controller,
        'constants': constants
    }
});




}(window,document,undefined));