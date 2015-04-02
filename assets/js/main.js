(function(window,document,undefined){
	
var mi = (function () {
    'use strict';

    function filters() {
        api.filters(arguments[0], arguments[1]);
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