var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',
    paths: {
        jquery: 'src/bower_components/jquery/dist/jquery.min',
        bootstrap: 'src/bower_components/bootstrap/dist/js/bootstrap.min',
        knockout: 'src/bower_components/knockout/dist/knockout',
        viewmodels: 'src/js/viewmodels',
        pages: 'src/js/pages',
        components: 'src/js/components',
        domReady: 'src/js/lib/domReady',
        text: 'src/js/lib/text',
        knocksnap: 'src/js/knocksnap/knocksnap',
        'knocksnap/models': 'src/js/knocksnap/models',
        'layoutGridStrategy': 'src/js/knocksnap/strategies/layoutGridStrategy'
    },
    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});
