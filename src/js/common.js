/**
 * Created by martinc on 18/03/2015.
 */

//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.
requirejs.config({
    baseUrl: './js',
    paths: {
        jquery: '../bower_components/jquery/dist/jquery.min',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        knockout: '../bower_components/knockout/dist/knockout',
        viewmodels: 'viewmodels',
        pages: 'pages',
        models: 'models',
        components: 'components',
        domReady: 'lib/domReady',
        text: 'lib/text',
        knocksnap: 'knocksnap/knocksnap',
        'knocksnap/models': 'knocksnap/models',
        'findNextPositionStrategy': 'knocksnap/strategies/findNextPositionStrategy'
    },
    shim: {
    bootstrap: {
        deps: ['jquery']
        }
    }
});

require(['jquery'], function ($) {
    // Configuration loaded now, safe to do other require calls
    // that depend on that config.

 require(['bootstrap'], function (bs) {
        // Configuration loaded now, safe to do other require calls
        // that depend on that config.


    });

});
